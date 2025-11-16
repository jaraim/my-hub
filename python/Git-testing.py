#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import threading
import requests
import time
import pyperclip
import os
import re
import sys

class GitMirrorTester:
    def __init__(self, root):
        self.root = root
        self.root.title("Git 镜像源测试工具")
        self.root.geometry("950x650")
        self.timeout = 10
        self.results = []
        self.is_testing = False
        self.app_dir = self._get_app_dir()
        self.default_file = os.path.join(self.app_dir, "mirrors.txt")
        self.archive_dir = os.path.join(os.path.expanduser("~"), "Desktop", "Git镜像源测试_保留")
        os.makedirs(self.archive_dir, exist_ok=True)
        self.create_widgets()
        self.load_default_file()

    def create_widgets(self):
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        main_frame.rowconfigure(7, weight=2)

        title = ttk.Label(main_frame, text="Git 镜像源测试工具", font=('Arial', 14, 'bold'))
        title.grid(row=0, column=0, columnspan=3, pady=(0, 10))

        ttk.Label(main_frame, text="直接输入镜像源（每行一个）：", font=('Arial', 10, 'bold')).grid(row=1, column=0, sticky=tk.W)

        self.input_text = scrolledtext.ScrolledText(main_frame, width=55, height=8, wrap=tk.WORD)
        self.input_text.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))

        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))

        self.load_default_btn = ttk.Button(btn_frame, text="📥 加载默认", command=self.load_default_file)
        self.load_default_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.import_btn = ttk.Button(btn_frame, text="📁 导入文件", command=self.select_file)
        self.import_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.clear_btn = ttk.Button(btn_frame, text="🗑️ 清空输入", command=self.clear_inputs)
        self.clear_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.crawl_btn = ttk.Button(btn_frame, text="🕸️ 一键爬取像源", command=self.crawl_mirrors)
        self.crawl_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.test_btn = ttk.Button(btn_frame, text="🚀 开始测试", command=self.start_test)
        self.test_btn.pack(side=tk.LEFT)

        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(main_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 5))

        self.status_label = ttk.Label(main_frame, text="就绪", font=('Arial', 9, 'italic'))
        self.status_label.grid(row=5, column=0, columnspan=2, sticky=tk.W, pady=(0, 5))

        ttk.Label(main_frame, text="测试结果：", font=('Arial', 10, 'bold')).grid(row=6, column=0, sticky=tk.W)

        columns = ("状态", "响应时间", "镜像源地址")
        self.tree = ttk.Treeview(main_frame, columns=columns, show="headings", height=12)
        self.tree.grid(row=7, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.tree.heading("状态", text="状态")
        self.tree.heading("响应时间", text="响应时间")
        self.tree.heading("镜像源地址", text="镜像源地址")

        self.tree.column("状态", width=80, anchor=tk.CENTER)
        self.tree.column("响应时间", width=100, anchor=tk.CENTER)
        self.tree.column("镜像源地址", width=450)

        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        scrollbar.grid(row=7, column=2, sticky=(tk.N, tk.S))
        self.tree.configure(yscrollcommand=scrollbar.set)

        bottom_frame = ttk.Frame(main_frame)
        bottom_frame.grid(row=8, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(10, 0))

        self.delete_btn = ttk.Button(bottom_frame, text="❌ 删除失败", command=self.delete_failed, state=tk.DISABLED)
        self.delete_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.save_clean_btn = ttk.Button(bottom_frame, text="💾 保存可用源", command=self.save_clean_list, state=tk.DISABLED)
        self.save_clean_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.save_btn = ttk.Button(bottom_frame, text="📄 保存完整报告", command=self.save_results)
        self.save_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.open_dir_btn = ttk.Button(bottom_frame, text="📂 打开保留目录", command=self.open_archive_dir)
        self.open_dir_btn.pack(side=tk.RIGHT)
        
        self.copy_btn = ttk.Button(bottom_frame, text="📋 复制配置", command=self.copy_config, state=tk.DISABLED)
        self.copy_btn.pack(side=tk.RIGHT, padx=(5, 0))

        self.copy_usage_btn = ttk.Button(bottom_frame, text="📋 复制使用说明", command=self.copy_usage, state=tk.DISABLED)
        self.copy_usage_btn.pack(side=tk.RIGHT, padx=(5, 0))

        self.usage_text = scrolledtext.ScrolledText(main_frame, width=90, height=8, wrap=tk.WORD)
        self.usage_text.grid(row=9, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(8, 0))
        self.usage_text.insert('1.0', '')
        self.usage_text.config(state=tk.DISABLED)

        proxy_frame = ttk.Frame(main_frame)
        proxy_frame.grid(row=10, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(6, 0))
        ttk.Label(proxy_frame, text="GitHub URL：").pack(side=tk.LEFT)
        self.github_url_entry = ttk.Entry(proxy_frame, width=60)
        self.github_url_entry.pack(side=tk.LEFT, padx=(5, 5))
        self.github_url_entry.insert(0, "https://github.com/owner/repo.git")
        self.copy_proxy_btn = ttk.Button(proxy_frame, text="📋 复制代理克隆命令", command=self.copy_proxy_clone, state=tk.DISABLED)
        self.copy_proxy_btn.pack(side=tk.LEFT)

    def select_file(self):
        filename = filedialog.askopenfilename(
            title="选择镜像源文件",
            filetypes=[("文本文件", "*.txt")],
            initialdir=self.app_dir
        )
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    self.input_text.delete('1.0', tk.END)
                    self.input_text.insert('1.0', f.read())
                self.status_label.config(text=f"✅ 已加载: {os.path.basename(filename)}")
            except Exception as e:
                messagebox.showerror("错误", f"无法读取文件: {e}")

    def load_default_file(self):
        if hasattr(self, 'default_file') and os.path.exists(self.default_file):
            try:
                with open(self.default_file, 'r', encoding='utf-8') as f:
                    self.input_text.delete('1.0', tk.END)
                    self.input_text.insert('1.0', f.read())
                self.status_label.config(text=f"✅ 已加载: {os.path.basename(self.default_file)}")
            except Exception as e:
                messagebox.showerror("错误", f"无法读取文件: {e}")
        else:
            messagebox.showwarning("提示", "未找到默认文件 mirrors.txt")

    def clear_inputs(self):
        self.input_text.delete('1.0', tk.END)
        self.tree.delete(*self.tree.get_children())
        self.results = []
        self.status_label.config(text="就绪")
        self.progress_var.set(0)
        self.delete_btn.config(state=tk.DISABLED)
        self.save_clean_btn.config(state=tk.DISABLED)
        self.copy_btn.config(state=tk.DISABLED)

    def start_test(self):
        if self.is_testing:
            return
        content = self.input_text.get('1.0', tk.END).strip()
        if not content:
            messagebox.showwarning("警告", "请输入或导入镜像源")
            return
        mirrors = [self._normalize_url(line.strip()) for line in content.split('\n') if line.strip() and not line.strip().startswith('#')]
        if not mirrors:
            messagebox.showwarning("警告", "未找到有效的镜像源")
            return
        self.is_testing = True
        self.test_btn.config(text="⏳ 测试中...", state=tk.DISABLED)
        self.load_default_btn.config(state=tk.DISABLED)
        self.import_btn.config(state=tk.DISABLED)
        self.clear_btn.config(state=tk.DISABLED)
        self.delete_btn.config(state=tk.DISABLED)
        self.save_clean_btn.config(state=tk.DISABLED)
        self.copy_btn.config(state=tk.DISABLED)
        self.results = []
        self.tree.delete(*self.tree.get_children())
        self.status_label.config(text=f"开始测试 {len(mirrors)} 个镜像源...")
        thread = threading.Thread(target=self.test_mirrors, args=(mirrors,))
        thread.daemon = True
        thread.start()

    def test_mirrors(self, mirrors):
        total = len(mirrors)
        for idx, mirror in enumerate(mirrors, 1):
            progress = (idx / total) * 100
            self.root.after(0, self.update_progress, progress, f"测试进度: {idx}/{total}")
            url = mirror.strip()
            status_code, duration, error = self.test_mirror(url)
            if error:
                result = (url, "❌ 失败", error, duration, False)
            else:
                if 200 <= status_code < 400:
                    result = (url, "✅ 成功", f"{status_code}", duration, True)
                else:
                    result = (url, "⚠️ 异常", f"{status_code}", duration, False)
            self.results.append(result)
            self.root.after(0, self.update_result, result)
        self.root.after(0, self.test_complete)

    def test_mirror(self, url):
        try:
            start_time = time.time()
            response = requests.head(url, timeout=self.timeout, allow_redirects=True)
            end_time = time.time()
            return response.status_code, end_time - start_time, None
        except requests.exceptions.Timeout:
            return None, self.timeout, "超时"
        except Exception as e:
            return None, 0, f"错误: {e}"

    def update_progress(self, value, text):
        self.progress_var.set(value)
        self.status_label.config(text=text)

    def update_result(self, result):
        url, status, msg, duration, success = result
        tag = 'success' if success else 'failed'
        self.tree.insert('', 'end', values=(status, f"{duration:.3f}s", url), tags=(tag,))
        if not hasattr(self, 'tree_style'):
            self.tree.tag_configure('success', foreground='#006400', background='#F0FFF0')
            self.tree.tag_configure('failed', foreground='#8B0000', background='#FFF0F0')
        self.tree.yview_moveto(1.0)

    def test_complete(self):
        self.is_testing = False
        self.test_btn.config(text="🚀 开始测试", state=tk.NORMAL)
        self.load_default_btn.config(state=tk.NORMAL)
        self.import_btn.config(state=tk.NORMAL)
        self.clear_btn.config(state=tk.NORMAL)
        working = [r for r in self.results if r[4]]
        failed = [r for r in self.results if not r[4]]
        self.delete_btn.config(state=tk.NORMAL if failed else tk.DISABLED)
        self.save_clean_btn.config(state=tk.NORMAL if working else tk.DISABLED)
        self.copy_btn.config(state=tk.NORMAL if working else tk.DISABLED)
        try:
            ts = time.strftime('%Y%m%d_%H%M%S')
            log_path = os.path.join(self.archive_dir, f"git_mirrors_test_{ts}.txt")
            with open(log_path, 'w', encoding='utf-8') as f:
                f.write("Git 镜像源测试日志\n")
                f.write("=" * 60 + "\n\n")
                f.write(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(f"✅ 可用镜像源 ({len(working)} 个):\n")
                for url, _, _, duration, _ in sorted(working, key=lambda x: x[3]):
                    f.write(f"   {duration:.3f}s  {url}\n")
                f.write("\n❌ 不可用镜像源:\n")
                for url, _, msg, duration, _ in failed:
                    f.write(f"   {duration:.3f}s  {url}  -> {msg}\n")
        except Exception:
            pass
        self.status_label.config(text=f"✅ 可用: {len(working)} 个 | ❌ 不可用: {len(failed)} 个")
        self.tree.yview_moveto(0.0)

    def delete_failed(self):
        working = [r for r in self.results if r[4]]
        failed = [r for r in self.results if not r[4]]
        if not failed:
            messagebox.showinfo("提示", "没有失败的镜像源需要删除")
            return
        confirm = messagebox.askyesno("确认删除", f"确定要删除 {len(failed)} 个失败的镜像源吗？")
        if not confirm:
            return
        self.results = working
        self.tree.delete(*self.tree.get_children())
        for result in working:
            url, status, msg, duration, _ = result
            self.tree.insert('', 'end', values=(status, f"{duration:.3f}s", url), tags=('success',))
        self.input_text.delete('1.0', tk.END)
        for url, _, _, _, _ in sorted(working, key=lambda x: x[3]):
            self.input_text.insert(tk.END, f"{url}\n")
        self.status_label.config(text=f"✅ 已清理失败源，列表已更新！可用: {len(working)} 个")
        self.delete_btn.config(state=tk.DISABLED)
        self.save_clean_btn.config(state=tk.NORMAL)
        self.copy_btn.config(state=tk.NORMAL)
        self.tree.yview_moveto(0.0)
        messagebox.showinfo("完成", "失败的镜像源已删除，输入框已更新为可用列表！")

    def save_clean_list(self):
        working = [r for r in self.results if r[4]]
        if not working:
            messagebox.showinfo("提示", "没有可用的镜像源")
            return
        filename = filedialog.asksaveasfilename(
            title="保存清理后的镜像源列表",
            defaultextension=".txt",
            initialfile="mirrors_clean.txt",
            filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
            initialdir=self.archive_dir
        )
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    for url, _, _, _, _ in sorted(working, key=lambda x: x[3]):
                        f.write(f"{url}\n")
                messagebox.showinfo(
                    "成功",
                    f"清理后的镜像源已保存到:\n\n{filename}\n\n"
                    "✅ 格式: 每行一个 URL\n"
                    "✅ 可直接导入本工具再次测试\n"
                    "✅ 可用于 Git 配置"
                )
            except Exception as e:
                messagebox.showerror("错误", f"保存失败: {e}")

    def copy_config(self):
        working = [r for r in self.results if r[4]]
        if not working:
            return
        primary = working[0][0]
        primary_norm = primary.rstrip('/')
        config = (
            '[url "' + primary_norm + '/"]\n'
            '    insteadOf = https://github.com/\n'
        )
        try:
            pyperclip.copy(config)
            self.primary_norm = primary_norm
            try:
                self.copy_proxy_btn.config(state=tk.NORMAL)
            except Exception:
                pass
            proxy_concat = f"{primary_norm}/https://github.com/owner/repo.git"
            usage = (
                "使用说明：\n"
                "1) 全局设置：\n"
                f"   git config --global url.\"{primary_norm}/\".insteadOf https://github.com/\n"
                "2) 验证：\n"
                "   git config --global -l\n"
                "3) 克隆示例：\n"
                "   git clone https://github.com/owner/repo.git （将自动走镜像）\n"
                "4) 取消加速：\n"
                f"   git config --global --unset-all url.\"{primary_norm}/\".insteadOf\n"
                "5) 替换URL方式（无需设置）：\n"
                f"   git clone {proxy_concat}\n"
                "提示：若出现 Initial URL is not allowed by proxy rules 错误，请使用上述拼接格式。\n"
            )
            try:
                self.usage_text.config(state=tk.NORMAL)
                self.usage_text.delete('1.0', tk.END)
                self.usage_text.insert('1.0', usage)
                self.usage_text.config(state=tk.DISABLED)
                self.copy_usage_btn.config(state=tk.NORMAL)
            except Exception:
                pass
            messagebox.showinfo("成功", "配置已复制到剪贴板！下方已显示使用说明。")
        except Exception as e:
            messagebox.showerror("错误", f"复制失败: {e}")

    def copy_usage(self):
        try:
            self.usage_text.config(state=tk.NORMAL)
            content = self.usage_text.get('1.0', tk.END).strip()
            self.usage_text.config(state=tk.DISABLED)
            if content:
                pyperclip.copy(content)
                messagebox.showinfo("成功", "使用说明已复制到剪贴板！")
            else:
                messagebox.showwarning("提示", "使用说明为空")
        except Exception as e:
            messagebox.showerror("错误", f"复制失败: {e}")

    def copy_proxy_clone(self):
        try:
            url = self.github_url_entry.get().strip()
            if not url:
                messagebox.showwarning("提示", "请输入 GitHub 克隆地址")
                return
            norm = self._normalize_github_url(url)
            domain = getattr(self, 'primary_norm', '').rstrip('/')
            if not domain:
                working = [r for r in self.results if r[4]]
                if working:
                    domain = working[0][0].rstrip('/')
            if not domain:
                messagebox.showwarning("提示", "请先进行测试以选择可用镜像源")
                return
            cmd = f"git clone {domain}/{norm}"
            pyperclip.copy(cmd)
            messagebox.showinfo("成功", "代理克隆命令已复制到剪贴板！")
        except Exception as e:
            messagebox.showerror("错误", f"复制失败: {e}")

    def _normalize_github_url(self, url):
        u = url.strip().strip('`').strip()
        if not u:
            return u
        if u.startswith('git@'):
            try:
                repo = u.split(':', 1)[1]
                if repo.endswith('.git'):
                    repo = repo[:-4]
                u = f"https://github.com/{repo}"
            except Exception:
                return u
        if u.startswith('github.com/'):
            u = 'https://' + u
        if not u.startswith('http'):
            if '/' in u and not u.startswith('https://github.com/'):
                u = 'https://github.com/' + u.lstrip('/')
            else:
                u = 'https://' + u.lstrip('/')
        if 'github.com' not in u:
            return u
        u = u.rstrip('/')
        if not u.endswith('.git'):
            u = u + '.git'
        return u

    def save_results(self):
        if not self.results:
            return
        filename = filedialog.asksaveasfilename(
            title="保存完整测试报告",
            defaultextension=".txt",
            initialfile="git_mirrors_report.txt",
            filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")],
            initialdir=self.archive_dir
        )
        if filename:
            try:
                working = [r for r in self.results if r[4]]
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write("Git 镜像源测试报告\n")
                    f.write("=" * 60 + "\n\n")
                    f.write(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    f.write(f"✅ 可用镜像源 ({len(working)} 个):\n")
                    for url, _, _, duration, _ in sorted(working, key=lambda x: x[3]):
                        f.write(f"   {duration:.3f}s  {url}\n")
                    f.write("\n🎯 Git 配置建议（示例，仅供参考）:\n")
                    if working:
                        primary = working[0][0].rstrip('/')
                        f.write(f'[url "{primary}/"]\n')
                        f.write('    insteadOf = https://github.com/\n')
                messagebox.showinfo("成功", f"完整报告已保存到: {filename}")
            except Exception as e:
                messagebox.showerror("错误", f"保存失败: {e}")

    def crawl_mirrors(self):
        if self.is_testing:
            messagebox.showwarning("警告", "测试进行中，无法爬取")
            return
        self.status_label.config(text="正在爬取镜像源...")
        try:
            self.crawl_btn.config(text="⏳ 爬取中...", state=tk.DISABLED)
        except Exception:
            pass
        self.test_btn.config(state=tk.DISABLED)
        self.load_default_btn.config(state=tk.DISABLED)
        self.import_btn.config(state=tk.DISABLED)
        self.clear_btn.config(state=tk.DISABLED)
        thread = threading.Thread(target=self._crawl_worker)
        thread.daemon = True
        thread.start()

    def _crawl_worker(self):
        headers = {"User-Agent": "Mozilla/5.0 GitMirrorTester"}
        queries = [
            "GitHub 镜像", "GitHub 加速 镜像", "GitHub 代理", "Git 镜像 国内",
            "GitLab 镜像 国内", "git clone 加速"
        ]
        search_pages = [
            *(f"https://duckduckgo.com/html/?q={requests.utils.quote(q)}" for q in queries),
            *(f"https://cn.bing.com/search?q={requests.utils.quote(q)}" for q in queries)
        ]
        seed_candidates = {
            "https://gitclone.com",
            "https://mirror.ghproxy.com",
            "https://ghproxy.net",
            "https://gh-proxy.com",
            "https://gh.api.99988866.xyz",
            "https://hub.fastgit.org",
            "https://hub.yzuu.cf",
            "https://hub.njuu.cf",
            "https://hub.nuaa.cf",
            "https://hub.fgit.ml",
            "https://hub.fgit.cf",
            "https://github.com.cnpmjs.org",
            "https://kgithub.com",
            "https://doc.fastgit.org",
            "https://git.yumenaka.net",
            "https://gh.flynp.org",
        }
        candidates = set()
        try:
            if os.path.exists(self.default_file):
                try:
                    with open(self.default_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                candidates.add(self._normalize_url(line))
                except Exception:
                    pass

            for url in search_pages:
                try:
                    r = requests.get(url, headers=headers, timeout=self.timeout)
                    links = re.findall(r'href=["\'](https?://[^"\'<>\s]+)["\']', r.text)
                    for link in links:
                        if self._looks_like_mirror(link):
                            candidates.add(self._normalize_url(link))
                except Exception:
                    pass

            for u in seed_candidates:
                candidates.add(self._normalize_url(u))

            verified = set()
            for u in candidates:
                try:
                    resp = requests.head(u, headers=headers, timeout=5, allow_redirects=True)
                    if resp.status_code is None or resp.status_code >= 500:
                        continue
                    verified.add(u)
                except Exception:
                    continue

            final = sorted(verified if verified else candidates)
            if final:
                with open(self.default_file, 'w', encoding='utf-8') as f:
                    for u in final:
                        f.write(u + "\n")
                self.root.after(0, lambda: self.status_label.config(text=f"✅ 已获取 {len(final)} 个镜像源并写入 mirrors.txt"))
                self.root.after(0, self.load_default_file)
            else:
                self.root.after(0, lambda: messagebox.showwarning("提示", "未获取到镜像源，请稍后重试"))
        finally:
            def reset():
                try:
                    self.crawl_btn.config(text="🕸️ 一键爬取像源", state=tk.NORMAL)
                except Exception:
                    pass
                self.test_btn.config(state=tk.NORMAL)
                self.load_default_btn.config(state=tk.NORMAL)
                self.import_btn.config(state=tk.NORMAL)
                self.clear_btn.config(state=tk.NORMAL)
            self.root.after(0, reset)

    def _normalize_url(self, url):
        url = url.strip().strip('`').strip().rstrip('/')
        if not url:
            return url
        if not url.startswith('http'):
            url = 'https://' + url
        return url

    def _looks_like_mirror(self, url):
        if not url.startswith('http'):
            return False
        try:
            host = url.split('://', 1)[1].split('/', 1)[0].lower()
        except Exception:
            return False
        if host in ('github.com', 'gitlab.com'):
            return False
        for bad in ('stackoverflow.com', 'zhihu.com', 'medium.com', 'docs', 'blog'):
            if bad in host:
                return False
        try:
            rest = url.split('://', 1)[1]
            parts = rest.split('/', 1)
            return len(parts) == 1 or parts[1] == ''
        except Exception:
            return False

    def open_archive_dir(self):
        try:
            os.makedirs(self.archive_dir, exist_ok=True)
            os.startfile(self.archive_dir)
        except Exception as e:
            messagebox.showerror("错误", f"无法打开目录: {e}")

    def _get_app_dir(self):
        try:
            if getattr(sys, 'frozen', False):
                return os.path.dirname(sys.executable)
            return os.path.dirname(os.path.abspath(__file__))
        except Exception:
            return os.getcwd()

def main():
    root = tk.Tk()
    app = GitMirrorTester(root)
    root.mainloop()

if __name__ == "__main__":
    main()
