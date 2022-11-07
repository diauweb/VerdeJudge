import type { Container, ContainerCreateOptions, ImageInfo } from 'dockerode';
import { existsSync, promises as fs } from 'fs';
import log from 'npmlog';
import path from 'path';
import docker from './docker';
import { TaskDirectory } from '$lib/utils';

const RUNTIME_PATH = './data/runtime';

async function dockerfileExists(f: string): Promise<boolean> {
	return existsSync(path.join(RUNTIME_PATH, f, 'Dockerfile'));
}


export interface RuntimeTask {
	containerTimeout: number,
	containerCreateOptions: ContainerCreateOptions,
	payload: {
		type: string,
		[x: string]: unknown
	},
	artifacts: string,
}

const runtimes = new Map<string, Runtime>();

export default class Runtime {
	name: string;
	image: Promise<ImageInfo>;

	private constructor(name: string) {
		this.name = name;
		this.image = this.getImage();
	}

	public isAvailable() {
		return this.image !== undefined && this.image !== null;
	}

	private async buildImage() {
		const contextDir = `./data/runtime/${this.name}`;
		const status = await docker.buildImage(
			{
				context: contextDir,
				src: await fs.readdir(contextDir)
			},
			{
				t: `verdejudge-runtime-${this.name}`
			}
		);

		await new Promise((resolve, reject) =>
			docker.modem.followProgress(status, (err, res) => (err ? reject(err) : resolve(res)))
		);
		log.info('runtime', 'successfully built image %j', this.name);
	}

	private async getImage0(): Promise<ImageInfo[]> {
		return await docker.listImages({
			filters: JSON.stringify({ label: [`verdejudge_runtime.name=${this.name}`] })
		});
	}

	private async getImage(): Promise<ImageInfo> {
		let images = await this.getImage0();

		if (images.length === 0) {
			log.info('runtime', 'no available %s image, building', this.name);
			await this.buildImage();
			images = await this.getImage0();
			if (images.length === 0) {
				log.error('runtime', 'cannot build image of %j', this.name);
				throw 'image not found';
			}
		}

		if (images.length > 1) {
			log.warn('runtime', 'more than one runtime image of %j is available', this.name);
			log.warn('runtime', 'it is recommended to keep only one of them.');
		}

		const image = images[0];
		return image;
	}

	private async withContainer(
		params: ContainerCreateOptions,
		dosth: (container: Container) => Promise<void>
	) {
		const image = await this.image;
		const container = await docker.createContainer({
			Image: image.Id,
			NetworkDisabled: true,
			...params
		});
		try {
			await dosth(container);
		} finally {
			await container.remove();
		}
	}

	public async runTask(task: RuntimeTask) {
		const params: ContainerCreateOptions = {
			StopTimeout: task.containerTimeout ?? 30,
			Cmd: [JSON.stringify(task.payload)],
			...task.containerCreateOptions,
		}
        
        let resultArtifacts: string | undefined = undefined;
		await this.withContainer(params, async (container) => {
			const tarFile = await new TaskDirectory(task.artifacts).tarAndDestroy();

			await container.putArchive(tarFile, { path: '/home/runner' });
			await fs.unlink(tarFile);
			
			await container.start();
			await container.wait();

			const stream = await container.getArchive({
				path: '/home/runner/'
			});

            resultArtifacts = (await TaskDirectory.fromTarStream(stream, { stripPath: 1 })).name;
		});

        if (!resultArtifacts) throw 'cannot generate artifact';

        return resultArtifacts;
	}

	public static async listRuntime(): Promise<string[]> {
		const ret: string[] = [];
		const files = await fs.readdir(RUNTIME_PATH);
		for (const f of files) {
			if (await dockerfileExists(f)) {
				ret.push(f);
			}
		}
		return ret;
	}

	public static async getRuntime(name: string): Promise<Runtime> {
		let rt = runtimes.get(name);
		if (rt) return rt;

		if (await dockerfileExists(name)) {
			rt = new Runtime(name);
			runtimes.set(name, rt);
			return rt;
		} else {
			throw `runtime ${name} not found`;
		}
	}
}
