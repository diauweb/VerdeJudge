FROM gcc:9 as BUILD

RUN apt-get update && apt-get install -y cmake libseccomp-dev\
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/QingdaoU/Judger /tmp/judger\
    && cd /tmp/judger\
    && git checkout 016653cedb0765d96ba999d86e14a033cb2fa875
WORKDIR /tmp/judger

RUN cmake . && make

FROM gcc:9 AS RUNTIME

LABEL verdejudge_runtime.name="gcc9"
LABEL verdejudge_runtime.release="1"

RUN mkdir -p /home/judger /home/runner
COPY --from=0 /tmp/judger/output/libjudger.so /home/judger/libjudger.so
COPY entrypoint.py /home/judger/entrypoint.py

ENTRYPOINT [ "python3", "/home/judger/entrypoint.py" ]