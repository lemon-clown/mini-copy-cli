* install `mini-copy-cli`
  ```shell
  yarn global add mini-copy-cli
  # or
  npm install -g mini-copy-cli
  ```

* paste the code below to `~/.vimrc`
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
