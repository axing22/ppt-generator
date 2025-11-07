'use client';

import React, { useState, useEffect } from 'react';

interface Slide {
  id: string;
  title: string;
  coreIdea: string;
  arguments: string[];
}

interface AIProvider {
  parseToSlides(text: string): Promise<Slide[]>;
}

export default function PyramidAIPresenter() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: '',
      coreIdea: '',
      arguments: ['', '', '']
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [importStartTime, setImportStartTime] = useState<number>(0);

  // 获取当前幻灯片
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // 根据论据数量检测布局类型
  const detectLayout = (argumentsCount: number) => {
    if (argumentsCount === 1) return 'process-flow';
    if (argumentsCount === 2) return 'two-columns';
    if (argumentsCount === 3) return 'three-columns';
    return 'three-columns'; // 超过3个时使用三列，后续可扩展分页
  };

  // 更新幻灯片内容
  const updateSlide = (field: keyof Slide, value: any) => {
    const updatedSlides = [...slides];
    if (field === 'arguments') {
      updatedSlides[currentSlideIndex][field] = value;
    } else {
      updatedSlides[currentSlideIndex][field] = value;
    }
    setSlides(updatedSlides);
  };

  // 添加幻灯片
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: '',
      coreIdea: '',
      arguments: ['', '', '']
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // 删除幻灯片
  const deleteSlide = () => {
    if (slides.length > 1) {
      const updatedSlides = slides.filter((_, index) => index !== currentSlideIndex);
      setSlides(updatedSlides);
      setCurrentSlideIndex(Math.min(currentSlideIndex, updatedSlides.length - 1));
    }
  };

  // 移动幻灯片位置
  const moveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;

    const updatedSlides = [...slides];
    const [movedSlide] = updatedSlides.splice(fromIndex, 1);
    updatedSlides.splice(toIndex, 0, movedSlide);

    setSlides(updatedSlides);
    setCurrentSlideIndex(toIndex);
  };

  // 添加论据
  const addArgument = () => {
    const currentSlide = slides[currentSlideIndex];
    updateSlide('arguments', [...currentSlide.arguments, '']);
  };

  // 更新论据
  const updateArgument = (index: number, value: string) => {
    const currentSlide = slides[currentSlideIndex];
    const updatedArguments = [...currentSlide.arguments];
    updatedArguments[index] = value;
    updateSlide('arguments', updatedArguments);
  };

  // 删除论据
  const removeArgument = (index: number) => {
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide.arguments.length > 1) {
      const updatedArguments = currentSlide.arguments.filter((_, i) => i !== index);
      updateSlide('arguments', updatedArguments);
    }
  };

  // 导出HTML
  const exportHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentSlide.title || '未命名幻灯片'}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .slide {
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #f5f5f5 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
        }
        .content {
            max-width: 1200px;
            padding: 2rem;
            text-align: center;
        }
        .title {
            font-size: 3rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 2rem;
        }
        .core-idea {
            background: linear-gradient(135deg, #e0f2fe 0%, #e8f5e8 100%);
            padding: 1.5rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            border: 2px solid #4caf50;
        }
        .arguments {
            display: grid;
            ${currentSlide.arguments.length === 1 ? 'grid-cols-1' :
              currentSlide.arguments.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}
            gap: 1rem;
            max-width: 1000px;
        }
        .argument {
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            border-left: 4px solid #00acc1;
            text-align: left;
        }
        .page-number {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #00acc1;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="slide">
        <div class="page-number">P${currentSlideIndex + 1} / ${slides.length}</div>
        <div class="content">
            <h1 class="title">${currentSlide.title || '未填写标题'}</h1>
            <div class="core-idea">
                <h3 style="font-size: 1.5rem; font-weight: 600; color: #2e7d32; margin-bottom: 0.5rem;">核心观点</h3>
                <p style="font-size: 1.25rem; font-weight: 500; color: #1b5e20;">${currentSlide.coreIdea || '未填写核心观点'}</p>
            </div>
            <div class="arguments">
                ${currentSlide.arguments.filter(arg => arg.trim()).map((arg, index) => {
                    const parts = arg.split(/[：:]/);
                    const title = parts[0] || `论据${index + 1}`;
                    const content = parts[1] || arg;
                    return `
                    <div class="argument">
                        <h4 style="font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">${title}</h4>
                        <p style="color: #374151; line-height: 1.5;">${content}</p>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSlide.title || '幻灯片'}_${currentSlideIndex + 1}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isPreviewMode) {
        if (e.key === 'ArrowLeft') {
          setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
        } else if (e.key === 'Escape') {
          setIsPreviewMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPreviewMode, currentSlideIndex, slides.length]);

  // 移动端检测
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 触摸手势支持（仅移动端预览模式）
  useEffect(() => {
    if (!isMobile || !isPreviewMode) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // 向左滑动 - 下一页页
          setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
        } else {
          // 向右滑动 - 上一页
          setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isPreviewMode, currentSlideIndex, slides.length]);

  // AI解析功能
  const parseText = async (text: string) => {
    try {
      const response = await fetch('/api/parse-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (result.success && result.slides) {
        setSlides(result.slides);
        setCurrentSlideIndex(0);
        return result;
      }
      throw new Error(result.error || '解析失败');
    } catch (error) {
      console.error('AI解析失败:', error);
      throw error;
    }
  };

  const currentLayout = detectLayout(currentSlide.arguments.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-white/30 to-white/10">
      {/* 顶部导航栏 - 响应式 */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-cyan-200/30">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">🔺 Pyramid AI</h1>

            {/* 桌面端按钮组 */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium"
              >
                ✨ 批量导入
              </button>
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-all duration-300 font-medium"
              >
                {isPreviewMode ? '编辑模式' : '预览模式'}
              </button>
              <button
                onClick={exportHTML}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-300 font-medium"
              >
                导出 HTML
              </button>
            </div>

            {/* 移动端菜单按钮 */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                <i className="fas fa-magic"></i>
              </button>
            </div>
          </div>

          {/* 移动端模式切换 */}
          <div className="sm:hidden mt-3 flex gap-2">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                !isPreviewMode
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              编辑
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                isPreviewMode
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              预览
            </button>
            <button
              onClick={exportHTML}
              className="bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-all duration-300 text-sm font-medium"
            >
              导出
            </button>
          </div>
        </div>
      </div>

      {/* 预览模式 */}
      {isPreviewMode ? (
        <div className={`${isMobile ? 'min-h-screen' : 'container mx-auto p-4 sm:p-8'}`}>
          {isMobile ? (
            /* 移动端全屏预览 */
            <div className="h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 relative">
              {/* 顶部控制栏 */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/20 to-transparent p-4 z-10">
                <div className="flex items-center justify-between text-white">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className="bg-black/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    <i className="fas fa-times mr-1"></i> 退出
                  </button>
                  <span className="bg-black/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                </div>
              </div>

              {/* 幻灯片内容 */}
              <div className="h-full flex flex-col justify-center px-6 py-20">
                {/* 页码标识 */}
                <div className="absolute top-16 right-4 bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  P{currentSlideIndex + 1}
                </div>

                {/* 标题 */}
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                  {currentSlide.title || '未填写标题'}
                </h1>

                {/* 核心观点 */}
                <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-4 rounded-xl mb-6 border-2 border-cyan-300/50">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">核心观点</h3>
                  <p className="text-lg font-bold text-cyan-700 text-center">
                    {currentSlide.coreIdea || '未填写核心观点'}
                  </p>
                </div>

                {/* 论据内容 */}
                <div className="flex-1 space-y-3">
                  {currentSlide.arguments.filter(arg => arg.trim()).map((arg, index) => {
                    const parts = arg.split(/[：:]/);
                    const title = parts[0] || `论据${index + 1}`;
                    const content = parts[1] || arg;
                    return (
                      <div
                        key={index}
                        className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border-l-4 border-cyan-500"
                      >
                        <h4 className="font-semibold text-gray-700 mb-2">{title}</h4>
                        <p className="text-sm text-gray-600">{content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 底部导航控制 */}
              <div className="absolute bottom-8 left-0 right-0 px-6">
                {/* 页面指示器 */}
                <div className="flex justify-center gap-2 mb-4">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentSlideIndex ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* 左右导航按钮 */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    className="bg-white/90 backdrop-blur w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-gray-600 disabled:opacity-50"
                    disabled={currentSlideIndex === 0}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {/* 手势提示 */}
                  <p className="text-xs text-gray-500 text-center">左右滑动切换页面</p>

                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    className="bg-white/90 backdrop-blur w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-gray-600 disabled:opacity-50"
                    disabled={currentSlideIndex === slides.length - 1}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 桌面端预览 */
            <div className="max-w-6xl mx-auto">
              <div className="bg-white/95 rounded-xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <div className="h-full flex flex-col">
                  {/* 幻灯片内容 */}
                  <div
                    className="flex-1 bg-gradient-to-br from-cyan-50/10 via-white/95 to-white/90 p-12 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,188,212,0.05) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.90) 100%)'
                    }}
                  >
                    {/* 背景动画 */}
                    <div
                      className="absolute top-0 right-0 w-96 h-96 opacity-30"
                      style={{
                        background: 'radial-gradient(circle, rgba(0,188,212,0.03) 0%, transparent 70%)',
                        animation: 'spin 20s linear infinite'
                      }}
                    />

                    {/* 页码 */}
                    <div className="absolute top-6 right-6 bg-cyan-100/50 px-3 py-1 rounded-full text-cyan-700 font-medium">
                      P{currentSlideIndex + 1} / {slides.length}
                    </div>

                    {/* 标题 */}
                    <h1 className="text-4xl font-bold text-slate-800 text-center mb-8 relative z-10">
                      {currentSlide.title || '未填写标题'}
                    </h1>

                    {/* 核心观点 */}
                    <div className="bg-gradient-to-br from-cyan-100/30 to-emerald-100/30 p-6 rounded-2xl mb-8 border-2 border-cyan-300/30 text-center relative z-10">
                      <h3 className="text-xl font-bold text-slate-700 mb-3">核心观点</h3>
                      <p className="text-2xl font-bold text-emerald-600">
                        {currentSlide.coreIdea || '未填写核心观点'}
                      </p>
                    </div>

                    {/* 论据内容 */}
                    <div className="flex-1 flex items-center justify-center relative z-10">
                      <div className={`w-full ${
                        currentLayout === 'two-columns' ? 'grid grid-cols-2 gap-8' :
                        currentLayout === 'three-columns' ? 'grid grid-cols-3 gap-6' :
                        'space-y-4'
                      }`}>
                        {currentSlide.arguments.filter(arg => arg.trim()).map((arg, index) => {
                          const parts = arg.split(/[：:]/);
                          const title = parts[0] || `论据${index + 1}`;
                          const content = parts[1] || arg;
                          return (
                            <div
                              key={index}
                              className="bg-white/90 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-all duration-300"
                            >
                              <h4 className="text-lg font-semibold text-slate-700 mb-3">{title}</h4>
                              <p className="text-slate-600 leading-relaxed">{content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 导航控制 */}
                  <div className="bg-white/90 px-6 py-4 flex items-center justify-between border-t border-cyan-200/30">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                      disabled={currentSlideIndex === 0}
                    >
                      ← 上一页
                    </button>

                    <div className="flex gap-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentSlideIndex ? 'bg-cyan-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                      className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                      disabled={currentSlideIndex === slides.length - 1}
                    >
                      下一页 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 编辑模式 - 响应式 */
        <div className={`${isMobile ? 'pb-20' : 'flex h-screen pt-16'}`}>
          {isMobile ? (
            /* 移动端单栏布局 */
            <div className="bg-gray-50 min-h-screen">
              {/* 幻灯片列表 */}
              <div className="p-4 space-y-4">
                {/* 当前编辑的幻灯片卡片 */}
                <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">P{currentSlideIndex + 1}</span>
                    <span className="text-xs text-gray-500">正在编辑</span>
                  </div>

                  {/* 移动端预览卡片 */}
                  <div className="bg-gradient-to-br from-cyan-50 to-white p-3 rounded-lg mb-4 border border-cyan-200">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                      {currentSlide.title || '未填写标题'}
                    </h3>
                    <div className="bg-blue-50 p-2 rounded mb-2">
                      <p className="text-sm font-medium text-blue-700">
                        {currentSlide.coreIdea || '未填写核心观点'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="bg-white p-2 rounded truncate">论据</div>
                      <div className="bg-white p-2 rounded truncate">支持</div>
                    </div>
                  </div>

                  {/* 移动端编辑表单 */}
                  <div className="space-y-4">
                    {/* 标题输入 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-heading mr-1"></i> 标题
                      </label>
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => updateSlide('title', e.target.value)}
                        placeholder="输入幻灯片标题"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 text-gray-700"
                      />
                    </div>

                    {/* 核心观点输入 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-lightbulb mr-1"></i> 核心观点
                      </label>
                      <textarea
                        value={currentSlide.coreIdea}
                        onChange={(e) => updateSlide('coreIdea', e.target.value)}
                        placeholder="输入核心观点"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-500 h-20 resize-none text-gray-700"
                      />
                    </div>

                    {/* 论据输入 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          <i className="fas fa-list mr-1"></i> 论据
                        </label>
                        <button
                          onClick={addArgument}
                          className="text-blue-500 text-sm font-medium"
                        >
                          <i className="fas fa-plus mr-1"></i> 添加
                        </button>
                      </div>
                      <div className="space-y-2">
                        {currentSlide.arguments.map((arg, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={arg}
                                  onChange={(e) => updateArgument(index, e.target.value)}
                                  placeholder={`论据${index + 1}: 描述内容`}
                                  className="w-full text-sm border-b border-gray-200 pb-1 mb-2 focus:border-blue-500 focus:outline-none text-gray-700"
                                />
                                <div className="flex gap-2">
                                  <button className="text-gray-400 text-xs">
                                    <i className="fas fa-grip-vertical"></i>
                                  </button>
                                  {currentSlide.arguments.length > 1 && (
                                    <button
                                      onClick={() => removeArgument(index)}
                                      className="text-red-400 text-xs"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-2">
                      {slides.length > 1 && (
                        <button
                          onClick={deleteSlide}
                          className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                        >
                          <i className="fas fa-trash mr-2"></i> 删除
                        </button>
                      )}
                      <button
                        onClick={() => setIsPreviewMode(true)}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                      >
                        <i className="fas fa-eye mr-2"></i> 预览
                      </button>
                    </div>
                  </div>
                </div>

                {/* 其他幻灯片卡片 */}
                {slides.map((slide, index) => (
                  index !== currentSlideIndex && (
                    <div
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(index)}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium">P{index + 1}</span>
                        <button className="text-gray-400">
                          <i className="fas fa-ellipsis-h"></i>
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{slide.title || '未命名幻灯片'}</h3>
                      <p className="text-sm text-gray-600 truncate">{slide.coreIdea || '未填写核心观点'}</p>
                    </div>
                  )
                ))}

                {/* 添加新幻灯片按钮 */}
                <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <i className="fas fa-plus text-2xl mb-2"></i>
                  <p className="font-medium">添加新幻灯片</p>
                </button>
              </div>
            </div>
          ) : (
            /* 桌面端 - 双栏布局 */
            <>
              {/* 左栏 - 思考区 (40%) */}
              <div className="w-2/5 bg-white/80 border-r border-cyan-200/30 overflow-y-auto">
                <div className="p-6">
                  {/* 幻灯片导航 */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">📝 思考区</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveSlide(currentSlideIndex, Math.max(0, currentSlideIndex - 1))}
                        className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
                        disabled={currentSlideIndex === 0}
                      >
                        ↑
                      </button>
                      <span className="text-sm text-slate-600">
                        {currentSlideIndex + 1} / {slides.length}
                      </span>
                      <button
                        onClick={() => moveSlide(currentSlideIndex, Math.min(slides.length - 1, currentSlideIndex + 1))}
                        className="p-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
                        disabled={currentSlideIndex === slides.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* 幻灯片选择器 */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {slides.map((slide, index) => (
                      <button
                        key={slide.id}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                          index === currentSlideIndex
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        P{index + 1}
                      </button>
                    ))}
                    <button
                      onClick={addSlide}
                      className="flex-shrink-0 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                    >
                      + 添加
                    </button>
                  </div>

                  {/* 结构化输入表单 */}
                  <div className="space-y-6">
                    {/* 标题输入 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-2">标题</label>
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => updateSlide('title', e.target.value)}
                        placeholder="例如：我都用了哪些AI大模型，有什么感受？"
                        className="w-full px-4 py-3 border-2 border-cyan-500 rounded-lg text-base focus:outline-none focus:border-cyan-600 text-slate-700 bg-white/80"
                      />
                    </div>

                    {/* 核心观点输入 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-2">核心观点</label>
                      <textarea
                        value={currentSlide.coreIdea}
                        onChange={(e) => updateSlide('coreIdea', e.target.value)}
                        placeholder="例如：AI 的差距，不在'会不会用'，而在'用对没用对模型'"
                        className="w-full px-4 py-3 border-2 border-cyan-500 rounded-lg text-base focus:outline-none focus:border-cyan-600 h-24 resize-vertical text-slate-700 bg-white/80"
                      />
                    </div>

                    {/* 论据输入 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-slate-700 font-semibold">论据</label>
                        <button
                          onClick={addArgument}
                          className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                        >
                          + 添加论据
                        </button>
                      </div>
                      <div className="space-y-3">
                        {currentSlide.arguments.map((arg, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={arg}
                              onChange={(e) => updateArgument(index, e.target.value)}
                              placeholder={`论据${index + 1}: 描述内容`}
                              className="flex-1 px-4 py-3 border-2 border-cyan-500 rounded-lg text-base focus:outline-none focus:border-cyan-600 text-slate-700 bg-white/80"
                            />
                            {currentSlide.arguments.length > 1 && (
                              <button
                                onClick={() => removeArgument(index)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-4">
                      {slides.length > 1 && (
                        <button
                          onClick={deleteSlide}
                          className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          删除幻灯片
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 右栏 - 预览区 (60%) */}
              <div className="flex-1 bg-gradient-to-br from-cyan-50/10 via-white/95 to-white/90">
                <div className="p-8 h-full flex flex-col">
                  <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">👀 实时预览</h2>

                  {/* 预览内容 */}
                  <div className="flex-1 bg-white/90 rounded-xl shadow-lg overflow-hidden relative">
                    {/* 背景动画效果 */}
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: 'radial-gradient(circle at 70% 30%, rgba(0,188,212,0.1) 0%, transparent 50%)'
                      }}
                    />

                    <div className="p-8 relative z-10 h-full flex flex-col">
                      {/* 标题 */}
                      <h3 className="text-3xl font-bold text-slate-800 text-center mb-6">
                        {currentSlide.title || <span className="text-gray-400 italic">未填写标题</span>}
                      </h3>

                      {/* 核心观点 */}
                      <div className="bg-gradient-to-br from-cyan-100/30 to-emerald-100/30 p-6 rounded-xl mb-6 border-2 border-cyan-300/30 text-center">
                        <h4 className="text-lg font-bold text-slate-700 mb-2">核心观点</h4>
                        <p className="text-xl font-bold text-emerald-600">
                          {currentSlide.coreIdea || <span className="text-gray-400 italic">未填写核心观点</span>}
                        </p>
                      </div>

                      {/* 论据预览 */}
                      <div className="flex-1">
                        {currentSlide.arguments.filter(arg => arg.trim()).length > 0 ? (
                          <div className={`h-full ${
                            currentLayout === 'two-columns' ? 'grid grid-cols-2 gap-6' :
                            currentLayout === 'three-columns' ? 'grid grid-cols-3 gap-4' :
                            'space-y-4'
                          }`}>
                            {currentSlide.arguments.filter(arg => arg.trim()).map((arg, index) => {
                              const parts = arg.split(/[：:]/);
                              const title = parts[0] || `论据${index + 1}`;
                              const content = parts[1] || arg;
                              return (
                                <div
                                  key={index}
                                  className="bg-white/80 p-4 rounded-lg shadow border-l-4 border-cyan-500 hover:shadow-md transition-all duration-300"
                                >
                                  <h5 className="font-semibold text-slate-700 mb-2">{title}</h5>
                                  <p className="text-slate-600 text-sm leading-relaxed">{content}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400 italic text-center">
                              请添加论据内容<br />
                              <span className="text-sm">支持使用冒号分隔标题和内容</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 布局指示器 */}
                      <div className="mt-4 text-center text-sm text-slate-500">
                        布局类型: {currentLayout === 'process-flow' ? '流程布局' :
                                 currentLayout === 'two-columns' ? '双栏布局' : '三列布局'} |
                        论据数量: {currentSlide.arguments.filter(arg => arg.trim()).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 批量导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  ✨ AI 智能导入
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  粘贴或输入文本内容
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="请输入需要解析的文本内容，AI会自动提取标题、核心观点和论据&#10;&#10;例如：&#10;&#10;主题：人工智能的发展&#10;核心观点：AI正在改变世界&#10;论据1：机器学习突破&#10;论据2：深度学习应用&#10;论据3：自然语言处理进步"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={async () => {
                    if (!importText.trim()) return;

                    setIsImporting(true);
                    setImportProgress('开始解析...');
                    setImportStartTime(Date.now());

                    try {
                      await parseText(importText);
                      setImportProgress('✅ 解析成功！');
                      setShowImportModal(false);
                      setImportText('');
                    } catch (error) {
                      console.error('解析失败:', error);
                      setImportProgress('❌ 解析失败，请重试');
                    } finally {
                      setIsImporting(false);
                    }
                  }}
                  disabled={isImporting || !importText.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isImporting ? `${importProgress} (${Math.round((Date.now() - importStartTime) / 1000)}s)` : '开始解析'}
                </button>
              </div>

              {/* 示例文本 */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2 font-medium">📝 示例文本：</p>
                <pre className="text-xs text-gray-500 whitespace-pre-wrap">
{`AI大模型使用体验

核心观点：AI的差距，不在"会不会用"，而在"用对没用对模型"

论据：
1. 模型选择：不同的AI模型适用于不同的任务场景
2. 提示词工程：好的提示词能显著提升AI回答质量
3. 成本效益：合理使用AI工具可以大幅提升工作效率`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 移动端底部导航栏 */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setIsPreviewMode(false)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                !isPreviewMode ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <i className="fas fa-edit text-xl"></i>
              <span className="text-xs">编辑</span>
            </button>
            <button
              onClick={() => setIsPreviewMode(true)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isPreviewMode ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <i className="fas fa-eye text-xl"></i>
              <span className="text-xs">预览</span>
            </button>
            <button
              onClick={exportHTML}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-gray-400 transition-colors"
            >
              <i className="fas fa-file-export text-xl"></i>
              <span className="text-xs">导出</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-gray-400 transition-colors"
            >
              <i className="fas fa-magic text-xl"></i>
              <span className="text-xs">AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}