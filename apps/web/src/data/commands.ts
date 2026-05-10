export interface CommandInfo {
  name: string;
  summary: string;
  usage: string;
  example: string;
}

export const COMMAND_REGISTRY: Record<string, CommandInfo> = {
  ls: {
    name: "ls",
    summary: "List directory contents",
    usage: "ls [options] [directory]",
    example: "ls -la",
  },
  pwd: {
    name: "pwd",
    summary: "Print working directory",
    usage: "pwd",
    example: "pwd",
  },
  cd: {
    name: "cd",
    summary: "Change the current directory",
    usage: "cd [directory]",
    example: "cd /home/user/documents",
  },
  mkdir: {
    name: "mkdir",
    summary: "Create a new directory",
    usage: "mkdir [directory_name]",
    example: "mkdir my_new_folder",
  },
  touch: {
    name: "touch",
    summary: "Create a new empty file",
    usage: "touch [file_name]",
    example: "touch notes.txt",
  },
  cat: {
    name: "cat",
    summary: "Concatenate and display file content",
    usage: "cat [file]",
    example: "cat readme.md",
  },
  cp: {
    name: "cp",
    summary: "Copy files or directories",
    usage: "cp [source] [destination]",
    example: "cp file.txt backup.txt",
  },
  mv: {
    name: "mv",
    summary: "Move or rename files or directories",
    usage: "mv [source] [destination]",
    example: "mv old_name.txt new_name.txt",
  },
  rm: {
    name: "rm",
    summary: "Remove files or directories",
    usage: "rm [file]",
    example: "rm -rf folder_to_delete",
  },
  echo: {
    name: "echo",
    summary: "Display a line of text",
    usage: "echo [string]",
    example: 'echo "Hello World"',
  },
  whoami: {
    name: "whoami",
    summary: "Print the current user ID and name",
    usage: "whoami",
    example: "whoami",
  },
  date: {
    name: "date",
    summary: "Print or set the system date and time",
    usage: "date",
    example: "date",
  },
  uname: {
    name: "uname",
    summary: "Print system information",
    usage: "uname [options]",
    example: "uname -a",
  },
  clear: {
    name: "clear",
    summary: "Clear the terminal screen",
    usage: "clear",
    example: "clear",
  },
  help: {
    name: "help",
    summary: "Display information about builtin commands",
    usage: "help",
    example: "help",
  },
};
