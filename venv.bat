@echo off
chcp 65001 >nul
title LemonAI 虚拟环境配置

echo == LemonAI 一键虚拟环境配置脚本 ==
echo.

echo [1/4] 检测 virtualenv 是否安装...
pip show virtualenv >nul 2>&1
if errorlevel 1 (
    echo 正在安装 virtualenv...
    pip install virtualenv --no-warn-script-location
    if errorlevel 1 (
        echo 安装失败！请检查网络连接
        pause
        exit /b 1
    )
) else (
    echo virtualenv 已安装 √
)

echo.
echo [2/4] 创建虚拟环境...
if not exist "venv\Scripts\activate" (
    virtualenv venv
    if errorlevel 1 (
        echo 虚拟环境创建失败！
        pause
        exit /b 1
    )
    echo 虚拟环境创建完成 √
) else (
    echo 虚拟环境已存在 √
)

echo.
echo [3/4] 激活虚拟环境...
call venv\Scripts\activate
if errorlevel 1 (
    echo 虚拟环境激活失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 检查 pip 版本...
pip list --outdated | findstr /i "^pip " >nul
if %errorlevel% equ 0 (
    echo 发现 pip 新版本，正在升级...
    python -m pip install --upgrade pip --no-warn-script-location
    if errorlevel 1 (
        echo pip 升级失败！
        pause
        exit /b 1
    )
    echo pip 升级完成 √
) else (
    echo pip 已经是最新版本 √
)

echo.
echo == 配置完成 ==
echo.
echo Python 路径: %VIRTUAL_ENV%
where python
where pip
echo.
echo +++++++++++++++++++++++++++++
echo   ✅ 虚拟环境已激活，可以直接使用
echo   可直接使用 python/pip
echo   不要关闭此窗口
echo +++++++++++++++++++++++++++++
echo.
REM 保持窗口打开，让用户可以直接使用虚拟环境
cmd /k "echo 虚拟环境已激活 √ & where python & echo. & echo 现在可以直接运行 python 命令了！"