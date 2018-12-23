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

# for wsl and windows
* v1.1.0: sharing the clipboard between wsl and windows.
* for vim:
  ```vimrc
  " for wsl bi-directional clipboard
  let s:clip = '/usr/me/bin/mcp'      " replace with your path (which mcp), same as the below.
  if executable(s:clip)
      noremap "+p :exe 'norm a'.system('/usr/me/bin/mcp --force-paste')<CR>
      augroup WSLYank
          autocmd!
          autocmd TextYankPost * call system('echo '.shellescape(join(v:event.regcontents, "\<CR>")).' | '.s:clip)
      augroup end
  endif
  ```
* thanks for [northerlywind 's answer](https://vi.stackexchange.com/a/16114/20180)


## update 2018-12-13
* `v1.2.0^`: sharing the clipboard between wsl and windows.
* for vim:
  ```vimrc
  " for wsl bi-directional clipboard
  let s:clip_command = '/usr/me/bin/mcp'
  if executable(s:clip_command)
    let resolved_clip_command = s:clip_command.' --silence '
    let s:resolved_clip_command = resolved_clip_command
    function CopyToSystemClipBoard()
      if v:event.regname ==# '+' || v:event.regname ==# 'e'
        call system(s:resolved_clip_command.shellescape(join(v:event.regcontents, "\<CR>")))
      elseif v:event.regname ==# ''
        let @t = @"
      endif
    endfunction

    " for paste: replace `+` to `e` (as there could not exist register `+`)
    noremap p "tp
    noremap "+ "e
    noremap <silent> "+p :exe 'norm a'.system(resolved_clip_command.' --force-paste')<CR><ESC>

    " for copy
    augroup WSLYank
      autocmd!
      autocmd TextYankPost * call CopyToSystemClipBoard()
    augroup END
  endif
  ```
