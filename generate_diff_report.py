#!/usr/bin/env python3
"""
ОТЧЕТ ОБ ИЗМЕНЕНИЯХ (DIFF)
--------------------------
Что делает этот скрипт:
1. Смотрит, какие файлы вы изменили или добавили в проекте (используя git).
2. Генерирует файл CHANGES_REPORT.md, в котором показывает разницу (что было -> что стало).
3. Включает в отчет и новые файлы, которые еще не добавлены в git (untracked).

Полезен для:
- Проверки своей работы перед коммитом.
- Создания наглядного списка изменений для отчета или ревью.

Запуск: python3 generate_diff_report.py
"""
import subprocess
import os

# ==========================================
# ⚙️ НАСТРОЙКИ (ЧТО ИГНОРИРОВАТЬ В ОТЧЕТЕ)
# ==========================================

# Файлы, которые мы не хотим видеть в отчете (например, сам файл отчета)
IGNORED_FILES = [
    '.DS_Store'
]

# ВАЖНО:
# Этот скрипт также использует стандартный .gitignore вашего проекта.
# Если вы хотите скрыть папку (например, venv/), добавьте её в файл .gitignore в корне проекта.

# Директория git-репозитория проекта (определяется автоматически)
REPO_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_markdown_diff():
    # Get the root of the git repo
    try:
        repo_root = subprocess.check_output(
            ['git', 'rev-parse', '--show-toplevel'],
            cwd=REPO_DIR
        ).decode('utf-8').rstrip('\n')
    except subprocess.CalledProcessError:
        print("Error: Not a git repository")
        return

    os.chdir(repo_root)
    
    # Get list of modified files (staged and unstaged)
    files = []
    try:
        # 1. Staged and unstaged changes known to git
        cmd_output = subprocess.check_output(['git', 'diff', '--name-only', 'HEAD']).decode('utf-8')
        files.extend([f for f in cmd_output.splitlines() if f.strip()])
        
        # 2. Untracked files (new files not yet added)
        untracked_output = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard']).decode('utf-8')
        files.extend([f for f in untracked_output.splitlines() if f.strip()])
        
        # Remove duplicates just in case
        files = sorted(list(set(files)))
        
    except subprocess.CalledProcessError:
        print("Error: Could not get git diff")
        return
    
    # Filter out ignored files and all .md files
    files = [f for f in files if not f.endswith('.md') and not any(ignored in f for ignored in IGNORED_FILES)]
    
    report_lines = ["# Отчет об изменениях кода\n"]
    
    # Add summary list of files
    report_lines.append("## Список измененных файлов\n")
    for file_path in files:
        report_lines.append(f"- `{file_path}`\n")
    report_lines.append("\n")
    
    for file_path in files:
        # Note: We don't check os.path.exists(file_path) here because we want to see diffs for deleted files too
            
        try:
            # Check if file is untracked (not in git yet)
            is_untracked = False
            try:
                subprocess.check_output(['git', 'ls-files', '--error-unmatch', file_path], stderr=subprocess.DEVNULL)
            except subprocess.CalledProcessError:
                is_untracked = True

            if is_untracked:
                 # For untracked files, we can't use git diff HEAD. Just read the file.
                 if os.path.exists(file_path):
                     with open(file_path, 'r', encoding='utf-8') as f:
                         content = f.read()
                     diff_output = f"New file: {file_path}\n@@ -0,0 +1,{len(content.splitlines())} @@\n+{content.replace(chr(10), chr(10)+'+')}"
                 else:
                     diff_output = "" # Should not happen if in list
            else:
                # Get diff for specific file
                diff_output = subprocess.check_output(['git', 'diff', 'HEAD', '--', file_path]).decode('utf-8')
            
            if not diff_output.strip():
                continue
                
            report_lines.append(f"## Файл: `{file_path}`\n")
            report_lines.append("```diff")
            
            # Process diff to make it cleaner if needed, or just dump it
            # git diff output is already quite readable for devs
            report_lines.append(diff_output.strip())
            report_lines.append("```\n")
            
            # Add a summary of changes
            added = diff_output.count('\n+')
            removed = diff_output.count('\n-')
            report_lines.append(f"**Статистика:** +{added} строк / -{removed} строк\n")
            report_lines.append("---\n")
            
        except subprocess.CalledProcessError:
            report_lines.append(f"Ошибка при получении diff для {file_path}\n")

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'CHANGES_REPORT.md')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(report_lines)
    
    print(f"Отчет успешно сгенерирован: {output_path}")

if __name__ == "__main__":
    generate_markdown_diff()
