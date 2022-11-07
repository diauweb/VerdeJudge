#!/usr/bin/python3
import os
import sys
import json
import random
import string
import subprocess

STATUS_EXCEPTION = -1
STATUS_CONTINUE = 0
STATUS_OK = 1
STATUS_WRONG_ANSWER = 10
STATUS_TIME_LIMIT_EXCEEDED = 20
STATUS_MEMORY_LIMIT_EXCEEDED = 21
STATUS_COMPILE_ERROR = 30
STATUS_RUNTIME_ERROR = 40
STATUS_SYSTEM_ERROR = 50

def get_random_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def compile_task(config):
    result = {
        "status": STATUS_EXCEPTION,
        "data": {}
    }

    try:
        source_file = config['source_file']
        optimization = config['optimization']
    
        flags = ["-Wall", "-DONLINE_JUDGE", "-lm"]
        if optimization is True:
            flags.append('-O2')
        elif isinstance(optimization, str):
            flags.append('-O' + optimization)
            
        input_name = f'/home/runner/{source_file}'
        output_name = f'/home/runner/program.out'

        compile_result = subprocess.run(["gcc", *flags, '-o', output_name, input_name], capture_output=True, timeout=5)
        result["data"]["compiler_message"] = compile_result.stderr.decode('utf-8')

        if compile_result.returncode == 0:
            result["status"] = STATUS_CONTINUE
        else:
            result["status"] = STATUS_COMPILE_ERROR
    except Exception as e:
        result["status"] = STATUS_EXCEPTION
        result["data"]["message"] = repr(e)
    
    return result

def run_task(config):
    result = {
        "status": STATUS_EXCEPTION,
        "data": {}
    }

    try:
        executable = '/home/runner/program.out'
        
        input_name = 'problem.in'
        output_name = 'problem.out'
        time_limit = config['time_limit'] or 1000
        mem_limit = config['memory_limit'] or 128

        input_file = f'/home/runner/{input_name}'
        output_file = f'/home/runner/{output_name}'

        print(["/home/judger/libjudger.so",
            f'--exe_path={executable}',
            f'--max_real_time={time_limit}',
            f'--max_memory={mem_limit*1024*1024}',
            f'--input_path={input_file}',
            f'--output_path={output_file}',
        ])

        run_result = subprocess.run(["/home/judger/libjudger.so",
            f'--exe_path={executable}',
            f'--max_real_time={time_limit}',
            f'--max_memory={mem_limit*1024*1024}',
            f'--input_path={input_file}',
            f'--output_path={output_file}',
        ], capture_output=True, env={'ONLINE_JUDGE': 'true'})

        print(run_result.stderr)

        result_json = json.loads(run_result.stdout.decode('utf-8'))
        result["data"]["usedTime"] = result_json["real_time"]
        result["data"]["usedMemory"] = result_json["memory"]
        result["data"]["sandbox_message"] = result_json

        return_code = result_json["result"]

        result["status"] = {
            0: STATUS_CONTINUE,
            1: STATUS_TIME_LIMIT_EXCEEDED,
            2: STATUS_TIME_LIMIT_EXCEEDED,
            3: STATUS_MEMORY_LIMIT_EXCEEDED,
            4: STATUS_RUNTIME_ERROR,
        }.get(return_code, STATUS_SYSTEM_ERROR)

    except Exception as e:
        result["status"] = STATUS_EXCEPTION
        result["data"]["message"] = repr(e)
    return result

def version_task(config):
    result = {
        "status": STATUS_CONTINUE,
        "data": {}
    }
    sandbox_info = subprocess.run(["/home/judger/libjudger.so", "--version"], capture_output=True)
    result["data"]["sandbox_info"] = sandbox_info.stdout.decode('utf-8')

    compiler_info = subprocess.run(["gcc", "-v"], capture_output=True)
    result["data"]["compiler_info"] = compiler_info.stderr.decode('utf-8')

    return result

def default_task(config):
    raise RuntimeError(f'the specified task is unsupported for this runtime')

def main():
    result = {}
    try:
        args = " ".join(sys.argv[1:])
        config = json.loads(args)
        print(config)
        task = config["type"]

        tasks = {
            "compile": compile_task,
            "run": run_task,
        }
        result = tasks.get(task, default_task)(config)

    except Exception as exp:
        result = {
            "status": -1,
            "data": { "message": repr(exp) }
        }
    print(result)
    with open('/home/runner/result.json', 'w') as f:
        json.dump(result, f)

if __name__ == '__main__':
    main()
