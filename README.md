# Install
```shell
npm install -g mini-copy-cli
```


# Usage
```shell
# output the content of the system clipboard
mcp


# copy the content of data.in to the system clipboard
mcp 'the data'
mcp -i data.in
mcp < data.in
cat data.in | mcp
echo 'Hello world' | mcp


# write the content of system clipboard into data.out
mcp >> data.out             # use linux pipeline, redirected the content of system clipboard to data.out
mcp -o data.out             # (recommended way)
mcp -o data.out -e UTF-8    # specified the content's encoding
mcp -o data.out -f          # if the data.out is exist, overwrite it without confirmation.


# show usage
mcp --help
```

# further usage

* [share clipboard in vim on wsl](./doc/wsl.md)
* use fake clipboard([en](./doc/fake-clipboard-en.md), [zh](./doc/fake-clipboard-zh.md))
