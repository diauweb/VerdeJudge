import { randomBytes } from 'crypto';
import path from 'path';
import { promises as fs, existsSync } from 'fs';
import tar from 'tar';
import type { Result } from './result';

export function toPlainObj<T, U = T>(object: T): U {
	return JSON.parse(JSON.stringify(object));
}

export function randomName() {
	return randomBytes(8).toString('hex');
}

const TEMP_DIR = './data/cache';
export class TaskDirectory {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	path(...name: string[]) {
		return path.join(TEMP_DIR, this.name, ...name);
	}

	async destroy() {
		await fs.rm(this.path(), { recursive: true, force: true });
	}

	async tar(): Promise<string> {
		const tarFile = path.join(TEMP_DIR, `${this.name}.A${randomName()}.tgz`);
		await tar.create(
			{
				gzip: true,
				file: tarFile,
				cwd: this.path(),
			},
			await fs.readdir(this.path())
		);

        return tarFile;
	}

    async tarAndDestroy(): Promise<string> {
        const name = await this.tar();
        await this.destroy();
        return name;
    }

	async findResult(): Promise<Result | null> {
		const fpath = this.path('result.json');
		if (existsSync(fpath)) {
			return JSON.parse((await fs.readFile(fpath)).toString());
		} else {
			return null;
		}
	}

	public static async make() {
		const name = randomName();
		await fs.mkdir(path.join(TEMP_DIR, name));
		return new TaskDirectory(name);
	}

    public static async fromTar(tarPath: string, options = { removeTar: false, stripPath: 0 }) {
		const name = randomName();
        const artFile = path.join(TEMP_DIR, name);
        await fs.mkdir(artFile);
        await tar.extract({ file: tarPath, cwd: artFile, strip: options.stripPath });
        if (options?.removeTar) {
            await fs.rm(tarPath);
        }
        return new TaskDirectory(name);
    }

	public static async fromTarStream(stream: NodeJS.ReadableStream, options = { stripPath: 0 }) {
		const tarPath = path.join(TEMP_DIR, `${randomName()}.tar`);
		await fs.writeFile(tarPath, stream);
		return await this.fromTar(tarPath, { removeTar: true, stripPath: options.stripPath });
	}
}
