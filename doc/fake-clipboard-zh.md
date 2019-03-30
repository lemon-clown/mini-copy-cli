fake-clipboard 用于在无图形界面的 `linux server` 中运行

# 使用
  ```shell
  yarn global add mini-copy-cli
  # 或者
  npm install -g mini-copy-cli
  mcp --fake <filepath>
  ```

* `fake` 选项用于指定临时文件位置，这个文件将作为伪剪切板（内容交互区）

# 更多用法
* 重命名 `mcp` （用于下叙步骤，如果选择其它名字，参考下面的步骤中也需跟着更改）
  ```shell
  cd /home/demo/.yarn/bin 
  mv mcp mcp_real
  ```
* 创建脚本 `/usr/bin/mcp`，内容为
  ```shell
  #! /usr/bin/env bash
  
  # I suppose that your mcp (installed by npm) is located at `/home/demo/.yarn/bin/mcp`
  COMMAND_PATH=/home/demo/.yarn/bin/mcp_real
  
  # the temp file which you want to make as a fake-clipboard
  FAKE_CLIPBOARD_PATH=/tmp/.fake_clip_board 
  
  # pass all the arguments to mcp_real
  $COMMAND_PATH --fake $FAKE_CLIPBOARD_PATH $*
  ```
  
* 如果想为不同的用户提供不同的剪切板，可以将 `mini-copy-cli` 安装到用户目录下
  
## 在 tmux 中使用
* 编辑 `.tmux.conf`
  ```conf
   bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel \;\
      run "tmux save-buffer - | /usr/me/bin/mcp --silence" \;\
      display-message "Clipboard copied"
  ```
* 然后在 `tmux` 的复制模式下，按 `y` 即可完成复制
  
## 在 vim 中使用
* 将下面代码添加进 `~/.vimrc` （或者其它位置，只要确保你的 vim 会读取它）
  ```vimrc
  " for vim share fake_clip
  let s:clip_command = '/usr/me/bin/mcp'
  if executable(s:clip_command)
    let resolved_clip_command = s:clip_command.' --silence '
    let s:resolved_clip_command = resolved_clip_command
    function CopyToSystemClipBoard()
      echom 'regname#'.v:event.regname.'#'
      if v:event.regname ==# '+' || v:event.regname ==# 'e'
        call system('echo '.shellescape(join(v:event.regcontents, "\n")).' | '.s:resolved_clip_command)
      elseif v:event.regname ==# ''
        let @t = @"
      endif
    endfunction
  
    " for paste: replace `+` to `e` (as there could not exist register `+`)
    noremap "+ "e
    noremap <silent> "+p :exe 'norm a'.system(resolved_clip_command.' --force-paste')<CR><ESC>
    noremap p "tp
  
    " for copy
    augroup WSLYank
      autocmd!
      autocmd TextYankPost * call CopyToSystemClipBoard()
    augroup END
  endif
  ```
  
* 使用 `"+y` 和 `"+p` 则将读取、写入远程主机的系统剪切板（也可能是 `mini-copy-cli` 模拟的剪切板）
  
## 使用 ssh 连接时，复制、粘贴远程主机内容
* 编辑 `/usr/bin/mcp`
  ```shell
  # 指定 `node` 的路径，在使用 ssh 连接时，可能会找不到该路径，显式指定能避免该问题
  # 例如：
  # export PATH=$PATH:/home/node/bin
  ```
* 执行 `ssh <remove-host> "/usr/bin/mcp --force-paste" | <local-clipboard>`
  - 你也可以在你的本地机器上安装 `mini-copy-li`，然后使用 `mcp` 代替 `<local-clipboard>`

* 使用脚本
  - 请先确保你以前合适地配置好了 ssh（无需指定密钥位置、端口号即可访问远程主机）
  - 本地安装 `mini-copy-cli` （或者使用你的系统剪切板也行）
  - 创建一个名为 `/usr/bin/remote-mcp` 的脚本，内容为：
    ```shell
    #! /usr/bin/env bash

    USAGE='usage: remote-mcp [--(copy|paste)] [remote-hostname]'

    mode='--copy'
    remote_host='remote-host'
    REMOTE_MCP_PATH='/usr/bin/mcp'
    LOCAL_MCP_PATH='mcp'  # 如果你没有在本地机器上安装 `mini-copy-cli`，需要改变这个值，可以使用本地系统剪切板的命令位置来代替

    if [[ "$#" -eq 1 ]]; then
      if [[ $1 =~ ^--(.*) ]]; then
        mode=$1
      else
        remote_host=$1
      fi
    elif [[ "$#" -eq 2 ]]; then
      mode=$1
      remote_host=$2
    elif [[ "$#" -ge 3 ]]; then
      echo ${USAGE}
      exit 0
    fi

    case ${mode} in
      ("--copy"*)
        ssh ${remote_host} "$REMOTE_MCP_PATH --force-paste" | LOCAL_MCP_PATH
        ;;
      ("--paste"*)
        tmp_file_name="/tmp/.mcp_clipboard"
        mcp -sof ${tmp_file_name}
        scp ${tmp_file_name} ${remote_host}:${tmp_file_name} 2&> /dev/null
        ssh ${remote_host} "$REMOTE_MCP_PATH -i $tmp_file_name" 2&> /dev/null
        echo -e "\033[01;30m$(date '+%Y-%m-%d %H:%M:%S') \033[01;00m[\033[01;32minfo  \033[01;30mmcp\033[01;00m]: \033[01;32mpasted to $remote_host."
        ;;
      *)
        echo -e "\033[01;30m$(date '+%Y-%m-%d %H:%M:%S') \033[01;00m[\033[01;31merror \033[01;30mmcp\033[01;00m]: \033[01;31mmode($mode) remote_host($remote_host)"
        echo ${USAGE}
        exit 0
    esac
    ```
