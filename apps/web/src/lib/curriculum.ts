// filepath: apps/web/src/lib/curriculum.ts
import type { Unit } from "@/types";

export const UNITS: Unit[] = [
  {
    id: "absolute-zero",
    slug: "absolute-zero",
    title: "Absolute Zero",
    subtitle: "Your first steps in the terminal",
    icon: "🐧",
    color: "#58a6ff",
    order: 1,
    requiredXpToUnlock: 0,
    quiz: [
      { id: "az-q1", question: "Which command prints the current directory?", options: ["ls", "pwd", "cd", "cat"], correctIndex: 1, explanation: "`pwd` stands for Print Working Directory." },
      { id: "az-q2", question: "Which command lists files?", options: ["pwd", "cat", "ls", "echo"], correctIndex: 2, explanation: "`ls` lists directory contents." },
      { id: "az-q3", question: "What does `cd ~` do?", options: ["Delete home dir", "Go to home dir", "List home dir", "Create home dir"], correctIndex: 1, explanation: "~ is shorthand for your home directory." },
      { id: "az-q4", question: "Which flag shows hidden files with ls?", options: ["-l", "-h", "-a", "-r"], correctIndex: 2, explanation: "`ls -a` shows all files including dotfiles." },
      { id: "az-q5", question: "What is the root directory?", options: ["/home", "/root", "/", "~"], correctIndex: 2, explanation: "/ is the top-level root directory on Linux." },
    ],
    lessons: [
      {
        id: "az-l1", unitId: "absolute-zero", title: "What is a Terminal?", description: "Meet your new best friend", icon: "💻", order: 1, totalXp: 30,
        steps: [
          { id: "az-l1-s1", type: "instruction", content: "# Welcome to the Terminal!\nThe terminal lets you control Linux with text commands. It's faster, more powerful, and very satisfying once you learn it. Let's start!", xp: 0 },
          { id: "az-l1-s2", type: "challenge", content: "Type `whoami` to see your username.", expectedCommands: ["whoami"], hint: "Just type: whoami", xp: 10 },
          { id: "az-l1-s3", type: "challenge", content: "Now type `pwd` to see where you are in the filesystem.", expectedCommands: ["pwd"], hint: "Type: pwd", xp: 10 },
          { id: "az-l1-s4", type: "explanation", content: "Great! `/home/user` is your home directory. Every user has one — it's your personal space on the system.", xp: 10 },
        ],
      },
      {
        id: "az-l2", unitId: "absolute-zero", title: "Listing Files", description: "See what's around you", icon: "📂", order: 2, totalXp: 30,
        steps: [
          { id: "az-l2-s1", type: "instruction", content: "# The `ls` Command\n`ls` lists the contents of a directory. It's one of the most-used commands in Linux.", xp: 0 },
          { id: "az-l2-s2", type: "challenge", content: "Type `ls` to see the files in your current directory.", expectedCommands: ["ls"], hint: "Type: ls", xp: 10 },
          { id: "az-l2-s3", type: "challenge", content: "Try `ls -a` to show hidden files (starting with a dot).", expectedCommands: ["ls -a"], hint: "Type: ls -a", xp: 10 },
          { id: "az-l2-s4", type: "challenge", content: "Try `ls -l` for a detailed long listing with permissions and sizes.", expectedCommands: ["ls -l"], hint: "Type: ls -l", xp: 10 },
        ],
      },
      {
        id: "az-l3", unitId: "absolute-zero", title: "Moving Around", description: "Navigate the filesystem", icon: "🧭", order: 3, totalXp: 30,
        steps: [
          { id: "az-l3-s1", type: "instruction", content: "# The `cd` Command\n`cd` (change directory) moves you through the filesystem. Think of it as clicking into folders.", xp: 0 },
          { id: "az-l3-s2", type: "challenge", content: "Go into the `projects` directory using `cd projects`.", expectedCommands: ["cd projects"], hint: "Type: cd projects", xp: 10 },
          { id: "az-l3-s3", type: "challenge", content: "Good! Now go back up one level with `cd ..`", expectedCommands: ["cd .."], hint: "Type: cd ..", xp: 10 },
          { id: "az-l3-s4", type: "challenge", content: "Go directly home with `cd ~`", expectedCommands: ["cd ~", "cd /home/user", "cd"], hint: "Type: cd ~", xp: 10 },
        ],
      },
    ],
  },
  {
    id: "beginner",
    slug: "beginner",
    title: "Beginner",
    subtitle: "Create and manage files",
    icon: "🌱",
    color: "#3fb950",
    order: 2,
    requiredXpToUnlock: 100,
    quiz: [
      { id: "bg-q1", question: "Which command creates an empty file?", options: ["mkdir", "touch", "cat", "new"], correctIndex: 1, explanation: "`touch` creates a new empty file." },
      { id: "bg-q2", question: "How do you create nested directories at once?", options: ["mkdir -n", "mkdir -p", "mkdir --all", "mkdir -r"], correctIndex: 1, explanation: "`mkdir -p` creates parent directories as needed." },
      { id: "bg-q3", question: "What does `cat` do?", options: ["Copy a file", "Print file contents", "Delete a file", "Move a file"], correctIndex: 1, explanation: "`cat` concatenates and prints file contents." },
      { id: "bg-q4", question: "How do you copy a directory recursively?", options: ["cp dir dest", "cp -r dir dest", "cp -d dir dest", "copy dir dest"], correctIndex: 1, explanation: "`cp -r` copies directories recursively." },
      { id: "bg-q5", question: "Which removes a non-empty directory?", options: ["rm dir", "rmdir dir", "rm -r dir", "del dir"], correctIndex: 2, explanation: "`rm -r` removes directories and their contents." },
    ],
    lessons: [
      {
        id: "bg-l1", unitId: "beginner", title: "Creating Files", description: "touch, mkdir, and more", icon: "✏️", order: 1, totalXp: 40,
        steps: [
          { id: "bg-l1-s1", type: "instruction", content: "# Creating Files with `touch`\n`touch filename` creates an empty file instantly. If the file already exists, it updates the timestamp.", xp: 0 },
          { id: "bg-l1-s2", type: "challenge", content: "Create a file called `notes.txt` using touch.", expectedCommands: ["touch notes.txt"], hint: "Type: touch notes.txt", xp: 10 },
          { id: "bg-l1-s3", type: "challenge", content: "Create a new directory called `workspace` using `mkdir`.", expectedCommands: ["mkdir workspace"], hint: "Type: mkdir workspace", xp: 10 },
          { id: "bg-l1-s4", type: "challenge", content: "Create nested directories `backup/2024/logs` in one command using `mkdir -p`.", expectedCommands: ["mkdir -p backup/2024/logs"], hint: "Type: mkdir -p backup/2024/logs", xp: 20 },
        ],
      },
      {
        id: "bg-l2", unitId: "beginner", title: "Reading Files", description: "Use cat to view content", icon: "📖", order: 2, totalXp: 30,
        steps: [
          { id: "bg-l2-s1", type: "instruction", content: "# Reading Files with `cat`\n`cat` prints file contents to the screen. Great for short files!", xp: 0 },
          { id: "bg-l2-s2", type: "challenge", content: "Read the `readme.txt` file using cat.", expectedCommands: ["cat readme.txt"], hint: "Type: cat readme.txt", xp: 15 },
          { id: "bg-l2-s3", type: "challenge", content: "Try reading a system file: `cat /etc/hostname`", expectedCommands: ["cat /etc/hostname"], hint: "Type: cat /etc/hostname", xp: 15 },
        ],
      },
      {
        id: "bg-l3", unitId: "beginner", title: "Copying & Moving", description: "cp and mv commands", icon: "📋", order: 3, totalXp: 40,
        steps: [
          { id: "bg-l3-s1", type: "instruction", content: "# `cp` and `mv`\n`cp source dest` copies files. `mv source dest` moves (or renames) them.", xp: 0 },
          { id: "bg-l3-s2", type: "challenge", content: "Copy `readme.txt` to `readme-backup.txt`.", expectedCommands: ["cp readme.txt readme-backup.txt"], hint: "Type: cp readme.txt readme-backup.txt", xp: 20 },
          { id: "bg-l3-s3", type: "challenge", content: "Rename `notes.txt` to `mynotes.txt` using mv.", expectedCommands: ["mv notes.txt mynotes.txt"], hint: "Type: mv notes.txt mynotes.txt", xp: 20 },
        ],
      },
      {
        id: "bg-l4", unitId: "beginner", title: "Deleting Files", description: "rm and rmdir", icon: "🗑️", order: 4, totalXp: 30,
        steps: [
          { id: "bg-l4-s1", type: "instruction", content: "# Deleting with `rm`\n`rm file` removes a file. `rm -r dir` removes a directory and everything inside. **Be careful — no recycle bin!**", xp: 0 },
          { id: "bg-l4-s2", type: "challenge", content: "Delete the `readme-backup.txt` file.", expectedCommands: ["rm readme-backup.txt"], hint: "Type: rm readme-backup.txt", xp: 15 },
          { id: "bg-l4-s3", type: "challenge", content: "Remove the `backup` directory and all its contents.", expectedCommands: ["rm -r backup", "rm -rf backup"], hint: "Type: rm -r backup", xp: 15 },
        ],
      },
    ],
  },
  {
    id: "intermediate",
    slug: "intermediate",
    title: "Intermediate",
    subtitle: "Permissions, processes & pipelines",
    icon: "⚡",
    color: "#d29922",
    order: 3,
    requiredXpToUnlock: 250,
    quiz: [
      { id: "im-q1", question: "What does `chmod 755` set?", options: ["Read-only for all", "rwxr-xr-x", "Full access for all", "No access"], correctIndex: 1, explanation: "755 = rwxr-xr-x: owner has full, group/others have r-x." },
      { id: "im-q2", question: "Which symbol pipes output to another command?", options: [">", ">>", "|", "&"], correctIndex: 2, explanation: "The pipe `|` sends stdout of one command to stdin of the next." },
      { id: "im-q3", question: "How do you redirect output to a file (overwrite)?", options: [">>", "|", ">", "<"], correctIndex: 2, explanation: "`>` redirects and overwrites; `>>` appends." },
      { id: "im-q4", question: "What shows running processes?", options: ["ls -p", "ps aux", "jobs", "proc"], correctIndex: 1, explanation: "`ps aux` shows all running processes." },
      { id: "im-q5", question: "What does `grep` do?", options: ["Copy files", "Search text patterns", "Show disk usage", "Edit files"], correctIndex: 1, explanation: "`grep` searches for patterns in text." },
    ],
    lessons: [
      {
        id: "im-l1", unitId: "intermediate", title: "File Permissions", description: "Read, write, execute", icon: "🔐", order: 1, totalXp: 40,
        steps: [
          { id: "im-l1-s1", type: "instruction", content: "# Linux File Permissions\nEvery file has three sets of permissions: **owner**, **group**, **others**.\nEach can have **r** (read=4), **w** (write=2), **x** (execute=1).\n\n`chmod 755 file` → rwxr-xr-x", xp: 0 },
          { id: "im-l1-s2", type: "challenge", content: "List files in long format to see permissions.", expectedCommands: ["ls -l"], hint: "Type: ls -l", xp: 10 },
          { id: "im-l1-s3", type: "explanation", content: "The first column shows permissions: `-rw-r--r--` means owner can read+write, others can only read.", xp: 30 },
        ],
      },
      {
        id: "im-l2", unitId: "intermediate", title: "Pipes & Redirection", description: "Combine commands powerfully", icon: "🔗", order: 2, totalXp: 40,
        steps: [
          { id: "im-l2-s1", type: "instruction", content: "# Pipes `|` and Redirection `>`\nPipes connect commands: `cmd1 | cmd2` feeds cmd1's output into cmd2.\nRedirection saves output: `cmd > file`.", xp: 0 },
          { id: "im-l2-s2", type: "challenge", content: "Use echo with redirection to write to a file: `echo 'hello' > test.txt`", expectedCommands: ["echo 'hello' > test.txt", 'echo "hello" > test.txt', "echo hello > test.txt"], hint: "Type: echo 'hello' > test.txt", xp: 20 },
          { id: "im-l2-s3", type: "challenge", content: "Verify the file was created: `cat test.txt`", expectedCommands: ["cat test.txt"], hint: "Type: cat test.txt", xp: 20 },
        ],
      },
      {
        id: "im-l3", unitId: "intermediate", title: "Searching with grep", description: "Find patterns in text", icon: "🔍", order: 3, totalXp: 30,
        steps: [
          { id: "im-l3-s1", type: "instruction", content: "# grep — Global Regular Expression Print\n`grep pattern file` searches for a pattern.\n- `-i` = case-insensitive\n- `-r` = recursive through directories\n- `-n` = show line numbers", xp: 0 },
          { id: "im-l3-s2", type: "challenge", content: "Search for 'Welcome' in readme.txt using grep.", expectedCommands: ["grep Welcome readme.txt", "grep 'Welcome' readme.txt"], hint: "Type: grep Welcome readme.txt", xp: 30 },
        ],
      },
    ],
  },
  {
    id: "intermediate-plus",
    slug: "intermediate-plus",
    title: "Intermediate+",
    subtitle: "Shell scripting & environment",
    icon: "🚀",
    color: "#bc8cff",
    order: 4,
    requiredXpToUnlock: 450,
    quiz: [
      { id: "ip-q1", question: "How do you make a script executable?", options: ["chmod +x script.sh", "exec script.sh", "run script.sh", "bash -x script.sh"], correctIndex: 0, explanation: "`chmod +x` adds execute permission to the file." },
      { id: "ip-q2", question: "What is `$1` in a shell script?", options: ["PID", "First argument", "Return code", "Home dir"], correctIndex: 1, explanation: "$1 is the first positional argument passed to the script." },
      { id: "ip-q3", question: "Which sets an environment variable?", options: ["var=val", "set var val", "export VAR=val", "env VAR=val"], correctIndex: 2, explanation: "`export VAR=val` sets and exports an environment variable." },
      { id: "ip-q4", question: "What does `$?` represent?", options: ["Current PID", "Last exit code", "Current user", "Script name"], correctIndex: 1, explanation: "$? holds the exit code of the last command (0 = success)." },
      { id: "ip-q5", question: "Which command shows environment variables?", options: ["vars", "printenv", "showenv", "getenv"], correctIndex: 1, explanation: "`printenv` or `env` lists all environment variables." },
    ],
    lessons: [
      {
        id: "ip-l1", unitId: "intermediate-plus", title: "Shell Scripts", description: "Automate with bash", icon: "📜", order: 1, totalXp: 50,
        steps: [
          { id: "ip-l1-s1", type: "instruction", content: "# Shell Scripting\nA shell script is a file with bash commands. Start with `#!/bin/bash` (the shebang line).\n\nExample:\n```bash\n#!/bin/bash\necho \"Hello, $1!\"\n```", xp: 0 },
          { id: "ip-l1-s2", type: "challenge", content: "Look at the hello.sh script: `cat projects/hello.sh`", expectedCommands: ["cat projects/hello.sh"], hint: "Type: cat projects/hello.sh", xp: 20 },
          { id: "ip-l1-s3", type: "explanation", content: "The `#!/bin/bash` line tells the OS to use bash to interpret the file. This is called a 'shebang'.", xp: 30 },
        ],
      },
      {
        id: "ip-l2", unitId: "intermediate-plus", title: "Variables & Environment", description: "Store and use values", icon: "🌍", order: 2, totalXp: 40,
        steps: [
          { id: "ip-l2-s1", type: "instruction", content: "# Variables\nAssign with `NAME=value` (no spaces!). Access with `$NAME`.\n\nEnvironment variables are available to all processes: `export PATH`, `export HOME`.", xp: 0 },
          { id: "ip-l2-s2", type: "challenge", content: "Print your home directory with `echo $HOME`", expectedCommands: ["echo $HOME", "echo ${HOME}"], hint: "Type: echo $HOME", xp: 20 },
          { id: "ip-l2-s3", type: "challenge", content: "Print the current username with `echo $USER`", expectedCommands: ["echo $USER", "echo ${USER}"], hint: "Type: echo $USER", xp: 20 },
        ],
      },
    ],
  },
  {
    id: "advanced",
    slug: "advanced",
    title: "Advanced",
    subtitle: "System mastery & automation",
    icon: "🏆",
    color: "#f85149",
    order: 5,
    requiredXpToUnlock: 700,
    quiz: [
      { id: "adv-q1", question: "What does `cron` do?", options: ["Compress files", "Schedule tasks", "Monitor logs", "Manage users"], correctIndex: 1, explanation: "cron is a time-based job scheduler in Unix-like systems." },
      { id: "adv-q2", question: "Which command shows disk usage?", options: ["ds", "df -h", "du -a", "mem"], correctIndex: 1, explanation: "`df -h` shows disk free space in human-readable format." },
      { id: "adv-q3", question: "What is SSH used for?", options: ["File transfer only", "Secure remote login", "Web serving", "DNS lookup"], correctIndex: 1, explanation: "SSH provides encrypted remote shell access." },
      { id: "adv-q4", question: "Which command monitors system resources in real-time?", options: ["ps", "ls -r", "top", "cat /proc"], correctIndex: 2, explanation: "`top` shows a live updating view of CPU, memory, and processes." },
      { id: "adv-q5", question: "How do you kill a process by PID?", options: ["stop PID", "kill PID", "end PID", "terminate PID"], correctIndex: 1, explanation: "`kill PID` sends SIGTERM to the process. Use `kill -9 PID` to force." },
    ],
    lessons: [
      {
        id: "adv-l1", unitId: "advanced", title: "Process Management", description: "Control running programs", icon: "⚙️", order: 1, totalXp: 50,
        steps: [
          { id: "adv-l1-s1", type: "instruction", content: "# Process Management\nEvery running program is a process with a unique PID.\n\n- `ps aux` — list all processes\n- `top` — live process monitor\n- `kill PID` — terminate a process\n- `&` — run in background", xp: 0 },
          { id: "adv-l1-s2", type: "challenge", content: "Check the system info with `uname -a`", expectedCommands: ["uname -a"], hint: "Type: uname -a", xp: 25 },
          { id: "adv-l1-s3", type: "explanation", content: "The kernel version, architecture, and hostname all appear in `uname -a`. This is your system's fingerprint.", xp: 25 },
        ],
      },
      {
        id: "adv-l2", unitId: "advanced", title: "System Info & Monitoring", description: "Know your system", icon: "📊", order: 2, totalXp: 50,
        steps: [
          { id: "adv-l2-s1", type: "instruction", content: "# System Monitoring\nKey commands:\n- `df -h` — disk usage\n- `free -h` — memory usage\n- `uptime` — how long system has been running\n- `whoami` — current user", xp: 0 },
          { id: "adv-l2-s2", type: "challenge", content: "Check the system date and time with `date`", expectedCommands: ["date"], hint: "Type: date", xp: 25 },
          { id: "adv-l2-s3", type: "challenge", content: "Display system information with `uname`", expectedCommands: ["uname", "uname -a"], hint: "Type: uname", xp: 25 },
        ],
      },
    ],
  },
];

export function getUnitById(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getLessonById(unitId: string, lessonId: string) {
  return getUnitById(unitId)?.lessons.find((l) => l.id === lessonId);
}

export function getTotalLessonsInUnit(unitId: string): number {
  return getUnitById(unitId)?.lessons.length ?? 0;
}
