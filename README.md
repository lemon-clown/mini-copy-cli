# Install
```shell
npm install -g mcp
```


# Usage
```shell
# output the content of the system clipboard
mcp


# copy the content of data.in to the system clipboard
mcp data.in


# write the content of system clipboard into data.out
mcp >> data.out             # use linux pipeline, redirected the content of system clipboard to data.out
mcp -o data.out             # (recommended way)
mcp -o data.out -e UTF-8    # specified the content's encoding
mcp -o data.out -f          # if the data.out is exist, overwrite it without confirmation.


# show usage
mcp --help
```