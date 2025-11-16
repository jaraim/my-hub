#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import threading
import time
import os
import sys
import socket
import struct
import pyperclip


class DNSOptimalTester:
    def __init__(self, root):
        self.root = root
        self.root.title("DNS 最优检测工具")
        self.root.geometry("920x640")

        self.timeout = 1.5
        self.is_testing = False
        self.results = []

        self.app_dir = self._get_app_dir()
        self.default_file = os.path.join(self.app_dir, "dns.txt")
        self.archive_dir = os.path.join(os.path.expanduser("~"), "Desktop", "DNS最优检测_保留")
        os.makedirs(self.archive_dir, exist_ok=True)

        self.test_domains = [
            "github.com",
            "raw.githubusercontent.com",
            "registry-1.docker.io",
            "index.docker.io",
            "hub.docker.com",
        ]

        self.default_servers = [
            "114.114.114.114",
            "223.5.5.5",
            "223.6.6.6",
            "180.76.76.76",
            "1.2.4.8",
            "119.29.29.29",
            "8.8.8.8",
            "1.1.1.1",
            "9.9.9.9",
        ]

        self.create_widgets()
        self.load_default_servers()

    def create_widgets(self):
        main = ttk.Frame(self.root, padding="10")
        main.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main.columnconfigure(0, weight=1)
        main.columnconfigure(1, weight=1)
        main.rowconfigure(3, weight=1)
        main.rowconfigure(6, weight=2)

        menubar = tk.Menu(self.root)
        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="📥 加载默认", command=self.load_default_servers)
        file_menu.add_command(label="📁 导入文件", command=self.select_file)
        file_menu.add_command(label="🗑️ 清空输入", command=self.clear_inputs)
        file_menu.add_separator()
        file_menu.add_command(label="退出", command=self.root.quit)
        menubar.add_cascade(label="文件", menu=file_menu)

        op_menu = tk.Menu(menubar, tearoff=0)
        op_menu.add_command(label="🚀 开始检测", command=self.start_test)
        menubar.add_cascade(label="操作", menu=op_menu)
        self.root.config(menu=menubar)

        title = ttk.Label(main, text="DNS 最优检测工具 (针对 Docker / Git)", font=("Arial", 14, "bold"))
        title.grid(row=0, column=0, columnspan=3, pady=(0, 8))

        ttk.Label(main, text="候选DNS（每行一个）：", font=("Arial", 10, "bold")).grid(row=1, column=0, sticky=tk.W)
        self.input_text = scrolledtext.ScrolledText(main, width=50, height=8, wrap=tk.WORD)
        self.input_text.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))

        btns = ttk.Frame(main)
        btns.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 8))
        self.load_btn = ttk.Button(btns, text="📥 加载默认", command=self.load_default_servers)
        self.load_btn.pack(side=tk.LEFT, padx=(0, 5))
        self.import_btn = ttk.Button(btns, text="📁 导入文件", command=self.select_file)
        self.import_btn.pack(side=tk.LEFT, padx=(0, 5))
        self.clear_btn = ttk.Button(btns, text="🗑️ 清空输入", command=self.clear_inputs)
        self.clear_btn.pack(side=tk.LEFT, padx=(0, 5))
        self.test_btn = ttk.Button(btns, text="🚀 开始检测", command=self.start_test)
        self.test_btn.pack(side=tk.LEFT)

        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(main, variable=self.progress_var, maximum=100)
        self.progress_bar.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 6))

        self.status_label = ttk.Label(main, text="就绪", font=("Arial", 9, "italic"))
        self.status_label.grid(row=5, column=0, columnspan=2, sticky=tk.W)

        ttk.Label(main, text="检测结果：", font=("Arial", 10, "bold")).grid(row=6, column=0, sticky=tk.W)
        columns = ("DNS服务器", "平均时延", "成功率", "最快域", "最慢域")
        self.tree = ttk.Treeview(main, columns=columns, show="headings", height=12)
        self.tree.grid(row=7, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        for col in columns:
            self.tree.heading(col, text=col)
        self.tree.column("DNS服务器", width=140)
        self.tree.column("平均时延", width=100, anchor=tk.CENTER)
        self.tree.column("成功率", width=80, anchor=tk.CENTER)
        self.tree.column("最快域", width=220)
        self.tree.column("最慢域", width=220)
        scroll = ttk.Scrollbar(main, orient=tk.VERTICAL, command=self.tree.yview)
        scroll.grid(row=7, column=2, sticky=(tk.N, tk.S))
        self.tree.configure(yscrollcommand=scroll.set)

        bottom = ttk.Frame(main)
        bottom.grid(row=8, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(8, 0))
        self.copy_best_btn = ttk.Button(bottom, text="📋 复制推荐DNS", command=self.copy_best, state=tk.DISABLED)
        self.copy_best_btn.pack(side=tk.LEFT, padx=(0, 5))
        self.copy_ps_btn = ttk.Button(bottom, text="📋 复制PowerShell设置命令", command=self.copy_ps_commands, state=tk.DISABLED)
        self.copy_ps_btn.pack(side=tk.LEFT, padx=(0, 5))
        self.open_dir_btn = ttk.Button(bottom, text="📂 打开保留目录", command=self.open_archive_dir)
        self.open_dir_btn.pack(side=tk.RIGHT)

        self.usage_text = scrolledtext.ScrolledText(main, width=90, height=7, wrap=tk.WORD)
        self.usage_text.grid(row=9, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(8, 0))
        self.usage_text.insert('1.0', self._usage_text())
        self.usage_text.config(state=tk.DISABLED)

    def _usage_text(self):
        return (
            "使用说明：\n"
            "1) 工具针对 Docker/Git 常用域进行DNS解析时延与成功率检测。\n"
            "2) 检测完成后，可复制推荐DNS或PowerShell命令（需管理员）。\n"
            "3) 推荐：优先使用国内公共DNS（114/223），网络不佳时尝试 1.1.1.1/8.8.8.8。\n"
        )

    def _get_app_dir(self):
        try:
            if getattr(sys, 'frozen', False):
                return os.path.dirname(sys.executable)
            return os.path.dirname(os.path.abspath(__file__))
        except Exception:
            return os.getcwd()

    def load_default_servers(self):
        content = "\n".join(self.default_servers)
        try:
            if os.path.exists(self.default_file):
                with open(self.default_file, 'r', encoding='utf-8') as f:
                    data = f.read().strip()
                    if data:
                        content = data
        except Exception:
            pass
        self.input_text.delete('1.0', tk.END)
        self.input_text.insert('1.0', content)
        self.status_label.config(text="✅ 已加载候选DNS")

    def select_file(self):
        filename = filedialog.askopenfilename(
            title="选择DNS列表文件",
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

    def clear_inputs(self):
        self.input_text.delete('1.0', tk.END)
        self.tree.delete(*self.tree.get_children())
        self.results = []
        self.status_label.config(text="就绪")
        self.progress_var.set(0)
        self.copy_best_btn.config(state=tk.DISABLED)
        self.copy_ps_btn.config(state=tk.DISABLED)

    def start_test(self):
        if self.is_testing:
            return
        content = self.input_text.get('1.0', tk.END).strip()
        if not content:
            messagebox.showwarning("警告", "请输入或导入候选DNS")
            return
        servers = [s.strip() for s in content.split('\n') if s.strip() and not s.strip().startswith('#')]
        if not servers:
            messagebox.showwarning("警告", "未找到有效的DNS服务器")
            return
        self.is_testing = True
        self.test_btn.config(text="⏳ 检测中...", state=tk.DISABLED)
        self.load_btn.config(state=tk.DISABLED)
        self.import_btn.config(state=tk.DISABLED)
        self.clear_btn.config(state=tk.DISABLED)
        self.copy_best_btn.config(state=tk.DISABLED)
        self.copy_ps_btn.config(state=tk.DISABLED)
        self.results = []
        self.tree.delete(*self.tree.get_children())
        self.status_label.config(text=f"开始检测 {len(servers)} 个DNS...")
        t = threading.Thread(target=self._test_worker, args=(servers,))
        t.daemon = True
        t.start()

    def _test_worker(self, servers):
        total = len(servers)
        for idx, server in enumerate(servers, 1):
            self.root.after(0, self.update_progress, (idx / total) * 100, f"检测进度: {idx}/{total}")
            stats = self._test_server(server)
            self.results.append(stats)
            self.root.after(0, self.update_result, stats)
        self.root.after(0, self.test_complete)

    def _test_server(self, server):
        durations = []
        successes = 0
        fastest = (None, float('inf'))
        slowest = (None, 0)
        for domain in self.test_domains:
            ok, dur = self._dns_query(server, domain)
            if ok:
                successes += 1
                durations.append(dur)
                if dur < fastest[1]:
                    fastest = (domain, dur)
                if dur > slowest[1]:
                    slowest = (domain, dur)
        avg = sum(durations) / len(durations) if durations else float('inf')
        success_rate = successes / len(self.test_domains)
        return {
            'server': server,
            'avg': avg,
            'rate': success_rate,
            'fast': fastest,
            'slow': slowest,
        }

    def _dns_query(self, server, domain):
        try:
            tid = int(time.time() * 1000) & 0xFFFF
            header = struct.pack('!HHHHHH', tid, 0x0100, 1, 0, 0, 0)
            qname = b''.join(len(label).to_bytes(1, 'big') + label.encode('ascii') for label in domain.split('.')) + b'\x00'
            question = qname + struct.pack('!HH', 1, 1)
            packet = header + question
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.settimeout(self.timeout)
            start = time.time()
            sock.sendto(packet, (server, 53))
            data, _ = sock.recvfrom(2048)
            end = time.time()
            if len(data) < 12:
                return False, self.timeout
            ancount = struct.unpack('!H', data[6:8])[0]
            rcode = data[3] & 0x0F
            sock.close()
            ok = (rcode == 0) and (ancount >= 0)
            return ok, end - start
        except Exception:
            return False, self.timeout

    def update_progress(self, value, text):
        self.progress_var.set(value)
        self.status_label.config(text=text)

    def update_result(self, stats):
        avg_ms = f"{stats['avg']*1000:.1f}ms" if stats['avg'] != float('inf') else "失败"
        rate = f"{int(stats['rate']*100)}%"
        fast = f"{stats['fast'][0]} ({stats['fast'][1]*1000:.1f}ms)" if stats['fast'][0] else "-"
        slow = f"{stats['slow'][0]} ({stats['slow'][1]*1000:.1f}ms)" if stats['slow'][0] else "-"
        tag = 'good' if stats['rate'] >= 0.6 and stats['avg'] < float('inf') else 'bad'
        self.tree.insert('', 'end', values=(stats['server'], avg_ms, rate, fast, slow), tags=(tag,))
        if not hasattr(self, 'tree_style'):
            self.tree.tag_configure('good', foreground='#006400', background='#F0FFF0')
            self.tree.tag_configure('bad', foreground='#8B0000', background='#FFF0F0')

    def test_complete(self):
        self.is_testing = False
        self.test_btn.config(text="🚀 开始检测", state=tk.NORMAL)
        self.load_btn.config(state=tk.NORMAL)
        self.import_btn.config(state=tk.NORMAL)
        self.clear_btn.config(state=tk.NORMAL)

        sorted_res = [r for r in self.results if r['avg'] != float('inf')]
        sorted_res.sort(key=lambda x: (-(x['rate']), x['avg']))
        if sorted_res:
            self.copy_best_btn.config(state=tk.NORMAL)
            self.copy_ps_btn.config(state=tk.NORMAL)
            best = ', '.join(r['server'] for r in sorted_res[:2])
            self.status_label.config(text=f"✅ 推荐DNS: {best}")
        else:
            self.copy_best_btn.config(state=tk.DISABLED)
            self.copy_ps_btn.config(state=tk.DISABLED)
            self.status_label.config(text="❌ 未检测到可用DNS")

        try:
            ts = time.strftime('%Y%m%d_%H%M%S')
            log_path = os.path.join(self.archive_dir, f"dns_test_{ts}.txt")
            with open(log_path, 'w', encoding='utf-8') as f:
                f.write("DNS 最优检测日志\n")
                f.write("=" * 60 + "\n\n")
                f.write(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                for r in self.results:
                    avg = f"{r['avg']*1000:.1f}ms" if r['avg'] != float('inf') else "失败"
                    rate = f"{int(r['rate']*100)}%"
                    f.write(f"{r['server']:>15}  平均: {avg:<8}  成功率: {rate}\n")
        except Exception:
            pass

    def copy_best(self):
        sorted_res = [r for r in self.results if r['avg'] != float('inf')]
        sorted_res.sort(key=lambda x: (-(x['rate']), x['avg']))
        if not sorted_res:
            return
        best_servers = [r['server'] for r in sorted_res[:2]]
        try:
            pyperclip.copy(
                "\n".join(best_servers)
            )
            messagebox.showinfo("成功", "推荐DNS已复制到剪贴板！")
        except Exception as e:
            messagebox.showerror("错误", f"复制失败: {e}")

    def copy_ps_commands(self):
        sorted_res = [r for r in self.results if r['avg'] != float('inf')]
        sorted_res.sort(key=lambda x: (-(x['rate']), x['avg']))
        if not sorted_res:
            return
        servers = [r['server'] for r in sorted_res[:2]]
        cmd = (
            'Get-DnsClient | Where-Object { $_.ConnectionStatus -eq "Connected" -and $_.InterfaceAlias -notmatch "Loopback|Virtual" } | ForEach-Object { '
            f'Set-DnsClientServerAddress -InterfaceAlias $_.InterfaceAlias -ServerAddresses "{servers[0]}","{servers[1] if len(servers)>1 else servers[0]}" }}'
        )
        try:
            pyperclip.copy(cmd)
            messagebox.showinfo("成功", "PowerShell设置命令已复制到剪贴板！(需管理员)")
        except Exception as e:
            messagebox.showerror("错误", f"复制失败: {e}")

    def open_archive_dir(self):
        try:
            os.makedirs(self.archive_dir, exist_ok=True)
            os.startfile(self.archive_dir)
        except Exception as e:
            messagebox.showerror("错误", f"无法打开目录: {e}")


def main():
    root = tk.Tk()
    app = DNSOptimalTester(root)
    root.mainloop()


if __name__ == "__main__":
    main()
