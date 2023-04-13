FROM alpine:3.14

COPY . /

RUN apk add --update --no-cache python3 && \
  ln -sf /usr/bin/python3 /usr/bin/python && \
  python -m ensurepip && \
  ln -sf /usr/bin/pip3 /usr/bin/pip && \
  pip install --no-cache -r requirements.txt

RUN apk add --update --no-cache nodejs npm && npm install

RUN mkdir cache