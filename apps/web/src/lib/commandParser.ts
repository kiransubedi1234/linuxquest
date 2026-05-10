// filepath: apps/web/src/lib/commandParser.ts
import type {
  CommandResult,
  VirtualFileSystem,
  FileSystemNode,
  SupportedCommand,
} from "@/types";

// ─── Virtual Filesystem Helpers ───────────────────────────────────────────────

export function createInitialVfs(): VirtualFileSystem {
  return {
    cwd: "/home/user",
    root: {
      home: {
        type: "dir",
        children: {
          user: {
            type: "dir",
            children: {
              Documents: { type: "dir", children: {} },
              Downloads: { type: "dir", children: {} },
              projects: { type: "dir", children: {} },
              "readme.txt": {
                type: "file",
                content:
                  "Welcome to LinuxQuest!\nThis is your home directory.\nType 'help' to see available commands.",
              },
              ".bashrc": {
                type: "file",
                content: "# ~/.bashrc: executed by bash for non-login shells.\nexport PATH=$PATH:$HOME/bin",
              },
            },
          },
        },
      },
      etc: {
        type: "dir",
        children: {
          "hostname": { type: "file", content: "linuxquest" },
          "os-release": {
            type: "file",
            content:
              'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu',
          },
        },
      },
      tmp: { type: "dir", children: {} },
      var: { type: "dir", children: { log: { type: "dir", children: {} } } },
    },
  };
}

/** Resolve a path (absolute or relative) against cwd */
function resolvePath(cwd: string, target: string): string {
  if (target === "~" || target === "") return "/home/user";
  if (target.startsWith("/")) return normalizePath(target);
  return normalizePath(`${cwd}/${target}`);
}

function normalizePath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return "/" + resolved.join("/");
}

/** Walk the VFS tree and return the node at `path`, or null */
function getNode(
  vfs: VirtualFileSystem,
  path: string
): FileSystemNode | null {
  if (path === "/") return { type: "dir", children: vfs.root };
  const parts = path.split("/").filter(Boolean);
  let current: Record<string, FileSystemNode> = vfs.root;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i]!;
    const node = current[key];
    if (!node) return null;
    if (i === parts.length - 1) return node;
    if (node.type !== "dir") return null;
    current = node.children;
  }
  return null;
}

function getParentAndKey(
  vfs: VirtualFileSystem,
  path: string
): { parent: Record<string, FileSystemNode>; key: string } | null {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const key = parts[parts.length - 1]!;
  const parentPath = "/" + parts.slice(0, -1).join("/");
  const parentNode = parentPath === "/" ? { type: "dir" as const, children: vfs.root } : getNode(vfs, parentPath);
  if (!parentNode || parentNode.type !== "dir") return null;
  return { parent: parentNode.children, key };
}

function cloneVfs(vfs: VirtualFileSystem): VirtualFileSystem {
  return JSON.parse(JSON.stringify(vfs)) as VirtualFileSystem;
}

// ─── Command Implementations ──────────────────────────────────────────────────

function cmdPwd(vfs: VirtualFileSystem): CommandResult {
  return { output: vfs.cwd, isError: false };
}

function cmdLs(vfs: VirtualFileSystem, args: string[]): CommandResult {
  const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
  const showLong = args.includes("-l") || args.includes("-la") || args.includes("-al");
  const pathArg = args.find((a) => !a.startsWith("-")) ?? vfs.cwd;
  const targetPath = resolvePath(vfs.cwd, pathArg);
  const node = getNode(vfs, targetPath);

  if (!node) {
    return {
      output: `ls: cannot access '${pathArg}': No such file or directory`,
      isError: true,
    };
  }
  if (node.type === "file") {
    return { output: pathArg, isError: false };
  }

  let entries = Object.keys(node.children);
  if (!showAll) entries = entries.filter((e) => !e.startsWith("."));
  entries.sort();

  if (showLong) {
    const lines = entries.map((name) => {
      const child = node.children[name]!;
      const isDir = child.type === "dir";
      const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--";
      const size = isDir ? 4096 : (child as { type: "file"; content: string }).content.length;
      return `${perm}  1 user user ${String(size).padStart(6)}  Jan  1 00:00 ${name}${isDir ? "/" : ""}`;
    });
    return { output: lines.join("\n") || "", isError: false };
  }

  return {
    output: entries
      .map((name) => {
        const child = node.children[name]!;
        return child.type === "dir" ? `\x1b[1;34m${name}/\x1b[0m` : name;
      })
      .join("  ") || "",
    isError: false,
  };
}

function cmdCd(vfs: VirtualFileSystem, args: string[]): CommandResult {
  const target = args[0] ?? "~";
  const newPath = resolvePath(vfs.cwd, target);
  const node = getNode(vfs, newPath);

  if (!node) {
    return { output: `bash: cd: ${target}: No such file or directory`, isError: true };
  }
  if (node.type !== "dir") {
    return { output: `bash: cd: ${target}: Not a directory`, isError: true };
  }
  return { output: "", isError: false, newCwd: newPath };
}

function cmdMkdir(vfs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: "mkdir: missing operand\nTry 'mkdir --help' for more information.", isError: true };
  }
  const newVfs = cloneVfs(vfs);
  for (const arg of args) {
    const targetPath = resolvePath(newVfs.cwd, arg);
    const result = getParentAndKey(newVfs, targetPath);
    if (!result) {
      return { output: `mkdir: cannot create directory '${arg}': No such file or directory`, isError: true };
    }
    if (result.parent[result.key]) {
      return { output: `mkdir: cannot create directory '${arg}': File exists`, isError: true };
    }
    result.parent[result.key] = { type: "dir", children: {} };
  }
  return { output: "", isError: false, newVfs };
}

function cmdTouch(vfs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: "touch: missing file operand\nTry 'touch --help' for more information.", isError: true };
  }
  const newVfs = cloneVfs(vfs);
  for (const arg of args) {
    const targetPath = resolvePath(newVfs.cwd, arg);
    const result = getParentAndKey(newVfs, targetPath);
    if (!result) {
      return { output: `touch: cannot touch '${arg}': No such file or directory`, isError: true };
    }
    if (!result.parent[result.key]) {
      result.parent[result.key] = { type: "file", content: "" };
    }
  }
  return { output: "", isError: false, newVfs };
}

function cmdCat(vfs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length === 0) {
    return { output: "cat: missing operand", isError: true };
  }
  const outputs: string[] = [];
  for (const arg of args) {
    const targetPath = resolvePath(vfs.cwd, arg);
    const node = getNode(vfs, targetPath);
    if (!node) {
      return { output: `cat: ${arg}: No such file or directory`, isError: true };
    }
    if (node.type === "dir") {
      return { output: `cat: ${arg}: Is a directory`, isError: true };
    }
    outputs.push(node.content);
  }
  return { output: outputs.join("\n"), isError: false };
}

function cmdCp(vfs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) {
    return { output: "cp: missing destination file operand after source\nTry 'cp --help' for more information.", isError: true };
  }
  const [src, dest] = args as [string, string];
  const srcPath = resolvePath(vfs.cwd, src);
  const srcNode = getNode(vfs, srcPath);
  if (!srcNode) {
    return { output: `cp: cannot stat '${src}': No such file or directory`, isError: true };
  }
  if (srcNode.type === "dir") {
    return { output: `cp: -r not specified; omitting directory '${src}'`, isError: true };
  }
  const newVfs = cloneVfs(vfs);
  const destPath = resolvePath(newVfs.cwd, dest);
  const destResult = getParentAndKey(newVfs, destPath);
  if (!destResult) {
    return { output: `cp: cannot create regular file '${dest}': No such file or directory`, isError: true };
  }
  destResult.parent[destResult.key] = { type: "file", content: srcNode.content };
  return { output: "", isError: false, newVfs };
}

function cmdMv(vfs: VirtualFileSystem, args: string[]): CommandResult {
  if (args.length < 2) {
    return { output: "mv: missing destination file operand\nTry 'mv --help' for more information.", isError: true };
  }
  const [src, dest] = args as [string, string];
  const srcPath = resolvePath(vfs.cwd, src);
  const srcNode = getNode(vfs, srcPath);
  if (!srcNode) {
    return { output: `mv: cannot stat '${src}': No such file or directory`, isError: true };
  }
  const newVfs = cloneVfs(vfs);
  const srcResult = getParentAndKey(newVfs, srcPath);
  if (!srcResult) {
    return { output: `mv: cannot move '${src}': No such file or directory`, isError: true };
  }
  const destPath = resolvePath(newVfs.cwd, dest);
  const destResult = getParentAndKey(newVfs, destPath);
  if (!destResult) {
    return { output: `mv: cannot move '${src}' to '${dest}': No such file or directory`, isError: true };
  }
  destResult.parent[destResult.key] = srcNode;
  delete srcResult.parent[srcResult.key];
  return { output: "", isError: false, newVfs };
}

function cmdRm(vfs: VirtualFileSystem, args: string[]): CommandResult {
  const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-fr");
  const fileArgs = args.filter((a) => !a.startsWith("-"));
  if (fileArgs.length === 0) {
    return { output: "rm: missing operand\nTry 'rm --help' for more information.", isError: true };
  }
  const newVfs = cloneVfs(vfs);
  for (const arg of fileArgs) {
    const targetPath = resolvePath(newVfs.cwd, arg);
    const node = getNode(newVfs, targetPath);
    if (!node) {
      return { output: `rm: cannot remove '${arg}': No such file or directory`, isError: true };
    }
    if (node.type === "dir" && !recursive) {
      return { output: `rm: cannot remove '${arg}': Is a directory`, isError: true };
    }
    const result = getParentAndKey(newVfs, targetPath);
    if (result) delete result.parent[result.key];
  }
  return { output: "", isError: false, newVfs };
}

function cmdEcho(args: string[]): CommandResult {
  return { output: args.join(" "), isError: false };
}

function cmdHelp(): CommandResult {
  const help = `\x1b[1;32mLinuxQuest Terminal — Available Commands\x1b[0m

  \x1b[1;33mNavigation\x1b[0m
    pwd              Print working directory
    ls [path]        List directory contents
    ls -l [path]     Long listing format
    ls -la [path]    Include hidden files
    cd [dir]         Change directory (cd ~ = home, cd .. = up)

  \x1b[1;33mFile Operations\x1b[0m
    touch <file>     Create empty file
    mkdir <dir>      Create directory
    cat <file>       Show file contents
    cp <src> <dest>  Copy file
    mv <src> <dest>  Move / rename file
    rm <file>        Delete file
    rm -r <dir>      Delete directory recursively

  \x1b[1;33mOutput\x1b[0m
    echo <text>      Print text to terminal
    clear            Clear the screen

  \x1b[1;33mSystem\x1b[0m
    whoami           Print current username
    date             Show current date/time
    uname            Show OS name
    man <cmd>        Show manual for command (basic)

Type any command to try it!`;
  return { output: help, isError: false };
}

function cmdWhoami(): CommandResult {
  return { output: "user", isError: false };
}

function cmdDate(): CommandResult {
  return { output: new Date().toString(), isError: false };
}

function cmdUname(args: string[]): CommandResult {
  if (args.includes("-a")) {
    return { output: "Linux linuxquest 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux", isError: false };
  }
  return { output: "Linux", isError: false };
}

function cmdMan(args: string[]): CommandResult {
  const cmd = args[0];
  if (!cmd) return { output: "What manual page do you want?", isError: true };
  const pages: Record<string, string> = {
    ls: "LS(1) — list directory contents\n\nUSAGE: ls [OPTION]... [FILE]...\n  -l   long listing format\n  -a   include hidden files (starting with .)",
    cd: "CD(1) — change the working directory\n\nUSAGE: cd [DIR]\n  ..   parent directory\n  ~    home directory",
    mkdir: "MKDIR(1) — make directories\n\nUSAGE: mkdir [OPTION]... DIRECTORY...\n  -p   create parent directories as needed",
    rm: "RM(1) — remove files or directories\n\nUSAGE: rm [OPTION]... FILE...\n  -r   remove directories and their contents recursively\n\n⚠️  rm has NO trash/undo — use with caution!",
    cp: "CP(1) — copy files and directories\n\nUSAGE: cp SOURCE DEST",
    mv: "MV(1) — move (rename) files\n\nUSAGE: mv SOURCE DEST",
    cat: "CAT(1) — concatenate files and print on the standard output\n\nUSAGE: cat [FILE]...",
  };
  const page = pages[cmd];
  if (!page) return { output: `No manual entry for ${cmd}`, isError: true };
  return { output: page, isError: false };
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

const SUPPORTED_COMMANDS: SupportedCommand[] = [
  "pwd", "ls", "cd", "mkdir", "touch", "cat", "cp", "mv", "rm",
  "clear", "help", "echo", "whoami", "date", "uname", "man",
];

export function parseCommand(
  input: string,
  vfs: VirtualFileSystem
): CommandResult & { isClear?: boolean } {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", isError: false };

  // Handle quoted strings properly
  const tokens = tokenize(trimmed);
  const [cmd, ...args] = tokens;

  if (!cmd) return { output: "", isError: false };

  switch (cmd.toLowerCase() as SupportedCommand) {
    case "pwd":   return cmdPwd(vfs);
    case "ls":    return cmdLs(vfs, args);
    case "cd":    return cmdCd(vfs, args);
    case "mkdir": return cmdMkdir(vfs, args);
    case "touch": return cmdTouch(vfs, args);
    case "cat":   return cmdCat(vfs, args);
    case "cp":    return cmdCp(vfs, args);
    case "mv":    return cmdMv(vfs, args);
    case "rm":    return cmdRm(vfs, args);
    case "echo":  return cmdEcho(args);
    case "help":  return cmdHelp();
    case "whoami": return cmdWhoami();
    case "date":  return cmdDate();
    case "uname": return cmdUname(args);
    case "man":   return cmdMan(args);
    case "clear":
      return { output: "", isError: false, isClear: true };
    default: {
      // Check for close matches (typos)
      const suggestion = findSuggestion(cmd);
      const suggestionMsg = suggestion
        ? `\nDid you mean: \x1b[1;33m${suggestion}\x1b[0m?`
        : "";
      return {
        output: `bash: ${cmd}: command not found${suggestionMsg}`,
        isError: true,
      };
    }
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  for (const char of input) {
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (char === " " && !inSingle && !inDouble) {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function findSuggestion(cmd: string): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const candidate of SUPPORTED_COMMANDS) {
    const d = levenshtein(cmd, candidate);
    if (d < bestDist && d <= 2) { bestDist = d; best = candidate; }
  }
  return best;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? dp[i - 1]![j - 1]!
        : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}

export { SUPPORTED_COMMANDS };
