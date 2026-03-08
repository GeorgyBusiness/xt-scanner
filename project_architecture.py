#!/usr/bin/env python3
"""
ГЕНЕРАТОР АРХИТЕКТУРНОГО ОТЧЕТА
-------------------------------
Что делает этот скрипт:
1. Создает полный "снимок" всего проекта в файле PROJECT_STRUCTURE.md.
2. Рисует наглядное дерево всех папок и файлов.
3. Копирует содержимое всех важных файлов (код, конфиги), чтобы можно было увидеть весь проект целиком.
4. Считает статистику: сколько файлов и строк кода написано на Python, JS, Svelte.

Полезен для:
- Передачи контекста проекта нейросети (LLM) для анализа.
- Знакомства нового разработчика с проектом.
- Архивации текущего состояния проекта.

Запуск: python3 project_architecture.py
"""
import os
import datetime
import subprocess

# Configuration
OUTPUT_FILE = "PROJECT_STRUCTURE.md"

# ==========================================
# ⚙️ НАСТРОЙКИ (ЧТО ИСКЛЮЧИТЬ ИЗ ОТЧЕТА)
# ==========================================

# Папки и файлы, которые будут ПОЛНОСТЬЮ проигнорированы
# (они не попадут ни в дерево файлов, ни в статистику)
EXCLUDE_DIRS = {
    "node_modules",      # Зависимости JS
    "__pycache__",       # Кэш питона
    ".pytest_cache",     # Кэш тестов
    ".venv", "venv",     # Виртуальные окружения
    ".git",              # Папка гита
    "dist", "build",     # Скомпилированные файлы
    ".egg-info",         # Служебные файлы питона
    "frontend/dist",     # Сборка фронтенда
    ".mypy_cache",       # Кэш проверки типов
    ".ruff_cache",       # Кэш линтера
    "SalutLoyaltyPlugin", # Плагин
    "project_architecture.py", # Сам генератор
    "generate_diff_report.py", # Скрипт дифов
    "PROJECT_STRUCTURE.md",    # Сам отчет
    "PROJECT_ARCHITECTURE.md", # Еще один отчет
    ".gitignore",              # Конфиги гита
    ".dockerignore",           # Конфиги докера
    "_Max_documentaion"        # Документация MAX
}


# Colors
GREEN = '\033[0;32m'
NC = '\033[0m'

def count_loc(file_path):
    """Count lines of code excluding comments/empty based on extension"""
    ext = os.path.splitext(file_path)[1].lower()
    count = 0
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                stripped = line.strip()
                if not stripped:
                    continue
                
                if ext == '.py':
                    if stripped.startswith('#'): continue
                elif ext in ['.js', '.ts', '.svelte']:
                    if stripped.startswith('//'): continue
                
                count += 1
    except Exception:
        return 0
    return count

def should_include_content(file_path):
    """Check if file content should be included in the report"""
    # Normalized path for checking
    path = file_path.replace(os.sep, '/')
    filename = os.path.basename(file_path)
    
    # Exclude directories (already handled by walker, but good check)
    if os.path.isdir(file_path): return False

    # Specific exclusions
    if "frontend/dist" in path: return False
    if "node_modules" in path: return False
    if "__pycache__" in path: return False
    if ".lock" in filename: return False
    if ".min." in filename: return False
    if filename == ".DS_Store": return False
    if filename.endswith(('.png', '.jpg', '.ico')): return False
    if filename in ["project_architecture.py", "generate_diff_report.py", "PROJECT_STRUCTURE.md", "PROJECT_ARCHITECTURE.md"]: return False
    
    # Specific inclusions
    # 1. Source code (Pulse Team Bot)
    if "src/" in path and filename.endswith(('.ts', '.js', '.json')): return True

    # 2. Python scripts
    if filename.endswith(".py"): return True
    
    # 3. Config files
    if filename.endswith(".env.example"): return True
    if filename == "pyproject.toml": return True
    if filename == "package.json": return True
    if filename == "vite.config.ts": return True
    if filename == "alembic.ini": return True
    
    # 4. Docker
    if "Dockerfile" in filename: return True
    if "docker-compose" in filename: return True
    if filename == ".dockerignore": return True
    
    # 5. Shell/Python scripts in root
    # Check if file is in root directory
    if os.path.dirname(path) in ['.', './', '']:
        if filename.endswith(('.sh', '.py')): return True
        
    # 6. Documentation
    if filename.upper() == "README.MD": return True
    if filename == "REFACTOR_REPORT.md": return True
    if "docs/" in path and filename.endswith(".md"): return True
    
    # Exclude self output
    if filename == "PROJECT_STRUCTURE.md": return False
    
    return False

def generate_tree(startpath, exclude_dirs):
    tree_str = ""
    prefix = "|-- "
    indent = "|   "
    
    # Collect all files first to sort them
    # We will use a recursive function to build the tree string
    
    def _walk(directory, level, prefix_str):
        nonlocal tree_str
        try:
            items = os.listdir(directory)
        except PermissionError:
            return

        # Filter items
        filtered_items = []
        for item in items:
            if item.startswith('.'): continue
            if item in exclude_dirs: continue
            
            # Check full path exclusions just in case
            full_path = os.path.join(directory, item)
            # Simple check if any excluded dir is in the path relative to root
            rel_path = os.path.relpath(full_path, startpath)
            if any(ex in rel_path.split(os.sep) for ex in exclude_dirs):
                continue
                
            filtered_items.append(item)
            
        filtered_items.sort()
        
        for i, item in enumerate(filtered_items):
            is_last = (i == len(filtered_items) - 1)
            full_path = os.path.join(directory, item)
            
            tree_str += f"{prefix_str}{prefix if not is_last else '`-- '}{item}\n"
            
            if os.path.isdir(full_path):
                new_prefix = prefix_str + (indent if not is_last else "    ")
                _walk(full_path, level + 1, new_prefix)

    # Use 'tree' command if available for better output, otherwise python fallback
    # But since we want to be portable, let's use the Python implementation primarily or check for tree
    # The shell script tried `tree` first.
    
    try:
        # Construct exclude pattern for tree command
        exclude_pattern = "|".join(exclude_dirs)
        result = subprocess.run(['tree', '-a', '-I', exclude_pattern, '--dirsfirst'], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout
    except FileNotFoundError:
        pass
        
    # Fallback to python implementation
    _walk(startpath, 0, "")
    return tree_str

def main():
    print(f"{GREEN}Starting Project Architecture Analysis...{NC}")
    print(f"Output file: {OUTPUT_FILE}")
    
    # Initialize stats
    stats = {
        "total_dirs": 0,
        "total_files": 0,
        "py_files": 0,
        "py_loc": 0,
        "ts_js_files": 0,
        "ts_js_loc": 0,
        "svelte_files": 0,
        "svelte_loc": 0,
        "config_files": 0,
        "md_files": 0
    }
    
    files_list = []
    
    print("Collecting file statistics...")
    
    for root, dirs, files in os.walk("."):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in EXCLUDE_DIRS]
        
        # Also check if current root contains excluded components
        rel_root = os.path.relpath(root, ".")
        if any(ex in rel_root.split(os.sep) for ex in EXCLUDE_DIRS):
            continue

        stats["total_dirs"] += len(dirs)
        
        for file in files:
            if file.startswith('.'): continue
            if file in EXCLUDE_DIRS: continue
            
            file_path = os.path.join(root, file)
            files_list.append(file_path)
            stats["total_files"] += 1
            
            loc = count_loc(file_path)
            ext = os.path.splitext(file)[1].lower()
            
            if ext == '.py':
                stats["py_files"] += 1
                stats["py_loc"] += loc
            elif ext in ['.ts', '.js']:
                stats["ts_js_files"] += 1
                stats["ts_js_loc"] += loc
            elif ext == '.svelte':
                stats["svelte_files"] += 1
                stats["svelte_loc"] += loc
            elif ext in ['.json', '.toml', '.yaml', '.yml', '.ini', '.xml']:
                stats["config_files"] += 1
            elif ext == '.md':
                stats["md_files"] += 1

    print(f"{GREEN}Generating {OUTPUT_FILE}...{NC}")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# 🏗️ АРХИТЕКТУРА ПРОЕКТА — PULSE TEAM BOT\n\n")
        f.write(f"Дата генерации: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Рабочая директория: {os.getcwd()}\n\n")
        f.write("***\n\n")
        f.write("## 📂 ЧАСТЬ 1: СТРУКТУРА ПРОЕКТА (ПОЛНОЕ ДЕРЕВО)\n\n")
        f.write("### Статистика:\n")
        f.write(f"- Всего директорий: {stats['total_dirs']}\n")
        f.write(f"- Всего файлов: {stats['total_files']}\n")
        f.write(f"- Python файлов: {stats['py_files']}\n")
        f.write(f"- TypeScript/JS файлов: {stats['ts_js_files']}\n")
        f.write(f"- Svelte компонентов: {stats['svelte_files']}\n\n")
        f.write("### Дерево файлов:\n\n")
        f.write("coffee-loyalty-2026/\n")
        
        # Generate Tree
        f.write(generate_tree(".", EXCLUDE_DIRS))
        
        f.write("\n\ntext\n\n***\n\n")
        f.write("## 📄 ЧАСТЬ 2: СОДЕРЖИМОЕ ФАЙЛОВ\n\n")
        
        print("Processing file contents...")
        files_list.sort()
        
        for file_path in files_list:
            # Rel path for checking
            rel_path = os.path.relpath(file_path, ".")
            if should_include_content(rel_path):
                print(f"Adding {rel_path}...")
                
                ext = os.path.splitext(file_path)[1].lower()
                lang = "text"
                if ext == '.py': lang = "python"
                elif ext == '.js': lang = "javascript"
                elif ext == '.ts': lang = "typescript"
                elif ext == '.svelte': lang = "html"
                elif ext == '.json': lang = "json"
                elif ext == '.toml': lang = "toml"
                elif ext in ['.yml', '.yaml']: lang = "yaml"
                elif ext == '.sh': lang = "bash"
                elif ext == '.md': lang = "markdown"
                
                f.write(f"#### 📄 {rel_path}\n")
                f.write(f"```{lang}\n")
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as source_file:
                        f.write(source_file.read())
                except Exception as e:
                    f.write(f"Error reading file: {e}")
                f.write("\n```\n\n")
                
        # Footer Statistics
        f.write("📊 ИТОГОВАЯ СТАТИСТИКА\n")
        f.write("По типам файлов:\n")
        f.write(f"Python (.py): {stats['py_files']} файлов, {stats['py_loc']} строк кода\n")
        f.write(f"TypeScript/JavaScript (.ts, .js): {stats['ts_js_files']} файлов, {stats['ts_js_loc']} строк\n")
        f.write(f"Svelte (.svelte): {stats['svelte_files']} файлов, {stats['svelte_loc']} строк\n")
        f.write(f"Config файлы: {stats['config_files']} файлов\n")
        f.write(f"Markdown: {stats['md_files']} файлов\n\n")
        f.write("По модулям:\n")
        
        # Count module files
        def count_module_files(path):
            count = 0
            # Try both relative to current and inside pulse_team_bot_real_estate
            search_paths = [path, os.path.join("pulse_team_bot_real_estate", path)]
            
            actual_path = None
            for p in search_paths:
                if os.path.exists(p):
                    actual_path = p
                    break
            
            if not actual_path: return 0
            
            for root, dirs, files in os.walk(actual_path):
                # Exclude dirs
                dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
                count += len([f for f in files if not f.startswith('.')])
            return count

        f.write(f"Core modules: {count_module_files('src/core')} файлов\n")
        f.write(f"Features: {count_module_files('src/features')} файлов\n")
        f.write(f"UI Modules: {count_module_files('src/ui')} файлов\n")
        f.write(f"Shared: {count_module_files('src/shared')} файлов\n")
        f.write(f"Infrastructure: {count_module_files('docker')} файлов\n\n")
        f.write("---\n")
        f.write("Generated by project_architecture.py\n")

    print(f"{GREEN}Done! Report saved to {OUTPUT_FILE}{NC}")

if __name__ == "__main__":
    main()
