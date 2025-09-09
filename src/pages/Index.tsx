import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Icon from '@/components/ui/icon';

const Index = () => {
  // RSVP Engine State
  const [text, setText] = useState("Добро пожаловать в SpeedRead! Это приложение поможет вам значительно увеличить скорость чтения с помощью технологии RSVP. Начните тренировку уже сейчас и отслеживайте свой прогресс.");
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([250]);
  const [wordsPerFrame, setWordsPerFrame] = useState(1);
  const [showCentralLetter, setShowCentralLetter] = useState(true);
  const [isUppercase, setIsUppercase] = useState(false);
  const [showFocusLine, setShowFocusLine] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('light');
  const [hideUI, setHideUI] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Touch/Gesture handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [uiLocked, setUiLocked] = useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Stats
  const [wordsRead, setWordsRead] = useState(1247);
  const [avgSpeed, setAvgSpeed] = useState(285);
  const [sessionsCompleted, setSessionsCompleted] = useState(12);
  const [readingProgress, setReadingProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Themes
  const themes = [
    { id: 'light', name: 'Classic Light', bg: 'bg-white', text: 'text-black', border: 'border-gray-200' },
    { id: 'dark', name: 'Classic Dark', bg: 'bg-black', text: 'text-white', border: 'border-gray-700' },
    { id: 'sepia', name: 'Sepia Print', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200' },
    { id: 'comfort', name: 'Eye Comfort', bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200' },
    { id: 'contrast', name: 'High Contrast', bg: 'bg-gray-900', text: 'text-yellow-400', border: 'border-yellow-600' },
    { id: 'minimal', name: 'Minimal Pro', bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300' }
  ];

  // Sample texts for library
  const sampleTexts = [
    {
      title: "Война и мир - Глава 1",
      author: "Л.Н. Толстой",
      content: "Ну вот наконец и кончился этот чёртов бал. Я умираю от усталости. Mais ce n'est rien, кошечка, говорил князь Андрей, подавая жене шубку.",
      words: 245,
      category: "Классика"
    },
    {
      title: "Алгоритмы и структуры данных",
      author: "Техническая литература", 
      content: "Алгоритм — это последовательность шагов для решения задачи. Эффективные алгоритмы позволяют обрабатывать большие объёмы данных за разумное время.",
      words: 156,
      category: "Обучение"
    },
    {
      title: "Новости технологий",
      author: "Tech Daily",
      content: "Искусственный интеллект продолжает развиваться семимильными шагами. Новые модели машинного обучения показывают впечатляющие результаты в различных областях применения.",
      words: 123,
      category: "Новости"
    }
  ];

  // Initialize words array
  useEffect(() => {
    const wordArray = text.split(' ').filter(word => word.trim() !== '');
    setWords(wordArray);
    setCurrentIndex(0);
    setReadingProgress(0);
  }, [text]);

  // RSVP Engine
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + wordsPerFrame;
          if (next >= words.length) {
            setIsPlaying(false);
            return words.length - 1;
          }
          setReadingProgress((next / words.length) * 100);
          return next;
        });
      }, 60000 / speed[0]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, words.length, wordsPerFrame]);

  // Get current word(s) to display
  const getCurrentWords = () => {
    if (words.length === 0) return '';
    const endIndex = Math.min(currentIndex + wordsPerFrame, words.length);
    const currentWords = words.slice(currentIndex, endIndex).join(' ');
    return isUppercase ? currentWords.toUpperCase() : currentWords;
  };

  // Highlight central letter
  const getWordWithHighlight = (word: string) => {
    if (!showCentralLetter || word.length === 0) return word;
    
    const centerIndex = Math.floor(word.length / 2);
    return (
      <>
        {word.slice(0, centerIndex)}
        <span className="central-letter">{word[centerIndex]}</span>
        {word.slice(centerIndex + 1)}
      </>
    );
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const jumpBack = () => {
    setCurrentIndex(Math.max(0, currentIndex - 5));
  };

  const jumpForward = () => {
    setCurrentIndex(Math.min(words.length - 1, currentIndex + 5));
  };

  const resetReading = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setReadingProgress(0);
  };

  const loadSampleText = (sampleText: any) => {
    setText(sampleText.content);
    resetReading();
  };

  // Touch handlers for gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!hideUI) return;
    
    const touch = e.touches[0];
    const startTime = Date.now();
    
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: startTime });
    
    // Long press detection
    const timeout = setTimeout(() => {
      setUiLocked(!uiLocked);
      navigator.vibrate && navigator.vibrate(50);
    }, 800);
    
    setLongPressTimeout(timeout);
  }, [hideUI, uiLocked]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!hideUI || !touchStart) return;
    
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    
    // Swipe detection
    if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 500) {
      if (deltaY > 0 && !uiLocked) {
        setHideUI(false);
      }
      setTouchStart(null);
      return;
    }
    
    // Tap detection
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      const screenWidth = window.innerWidth;
      const tapX = touch.clientX;
      
      if (tapX < screenWidth / 3) {
        jumpBack();
      } else if (tapX > (screenWidth * 2) / 3) {
        jumpForward();
      } else {
        setIsPlaying(!isPlaying);
      }
    }
    
    setTouchStart(null);
  }, [hideUI, touchStart, longPressTimeout, uiLocked, isPlaying]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    try {
      const fileText = await file.text();
      const cleanText = fileText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      setText(cleanText);
      resetReading();
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // URL fetch handler
  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const content = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      const cleanText = textContent.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
      setText(cleanText);
      resetReading();
      setUrlInput('');
    } catch (error) {
      console.error('Error loading URL:', error);
      alert('Ошибка загрузки URL. Проверьте ссылку.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  // Fullscreen mode with gestures
  if (hideUI) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center relative ${currentThemeData.bg} ${currentThemeData.text} touch-none select-none`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        {/* Gesture indicators */}
        {!uiLocked && (
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-50">
            <div className="text-xs">👈 Назад</div>
            <div className="text-xs">👆 Выход</div>
            <div className="text-xs">👉 Вперёд</div>
          </div>
        )}
        
        {uiLocked && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              🔒 Заблокировано
            </Badge>
          </div>
        )}
        
        <div className="relative w-full px-8">
          {showFocusLine && (
            <div className="focus-line top-1/2 transform -translate-y-1/2" />
          )}
          <div className="reading-word text-center text-4xl md:text-6xl font-medium tracking-wide">
            {wordsPerFrame === 1 ? 
              getWordWithHighlight(getCurrentWords()) : 
              getCurrentWords()
            }
          </div>
        </div>

        {/* Bottom progress */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-sm mb-2 opacity-70">
            <span>{currentIndex + 1}/{words.length}</span>
            <span>{speed[0]} WPM</span>
          </div>
          <Progress value={readingProgress} className="h-1" />
        </div>

        {/* Play/pause indicator */}
        <div className="absolute bottom-16 right-4">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-red-500'} opacity-70`} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Icon name="Book" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">SpeedRead</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Improve Your Reading Speed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="animate-fade-in text-xs">
              {speed[0]} WPM
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setHideUI(true)} className="h-8 w-8 p-0">
              <Icon name="Maximize" size={14} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <Tabs defaultValue="reader" className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="reader">Чтение</TabsTrigger>
            <TabsTrigger value="library">Библиотека</TabsTrigger>
            <TabsTrigger value="themes">Темы</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          {/* Reader Tab */}
          <TabsContent value="reader" className="space-y-4">
            {/* Reading Window */}
            <Card className={`${currentThemeData.bg} ${currentThemeData.text} ${currentThemeData.border} min-h-[200px] md:min-h-[300px] animate-scale-in`}>
              <CardContent className="flex flex-col h-[200px] md:h-[300px] p-4 md:p-8">
                {/* Progress */}
                <div className="mb-4">
                  <Progress value={readingProgress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                    <span>Слово {currentIndex + 1} из {words.length}</span>
                    <span>{Math.round(readingProgress)}%</span>
                  </div>
                </div>

                {/* Reading Area */}
                <div className="flex-1 flex items-center justify-center relative">
                  {showFocusLine && (
                    <div className="focus-line top-1/2 transform -translate-y-1/2" />
                  )}
                  <div className="reading-word text-center px-4 text-2xl md:text-4xl">
                    {wordsPerFrame === 1 ? 
                      getWordWithHighlight(getCurrentWords()) : 
                      getCurrentWords()
                    }
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Quick Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speed Control */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Gauge" size={20} />
                    Скорость чтения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">100 WPM</span>
                    <span className="font-semibold">{speed[0]} WPM</span>
                    <span className="text-sm">1000 WPM</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={100}
                    max={1000}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSpeed([Math.max(100, speed[0] - 25)])}
                      className="ios-button"
                    >
                      <Icon name="Minus" size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSpeed([Math.min(1000, speed[0] + 25)])}
                      className="ios-button"
                    >
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Settings" size={20} />
                    Настройки отображения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Слов в кадре</span>
                    <Select value={wordsPerFrame.toString()} onValueChange={(v) => setWordsPerFrame(parseInt(v))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Центральная буква</span>
                    <Switch checked={showCentralLetter} onCheckedChange={setShowCentralLetter} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Верхний регистр</span>
                    <Switch checked={isUppercase} onCheckedChange={setIsUppercase} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Линия фокуса</span>
                    <Switch checked={showFocusLine} onCheckedChange={setShowFocusLine} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Text Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="FileText" size={18} />
                  Текст для чтения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Вставьте текст для скоростного чтения..."
                  className="min-h-[100px] resize-none text-sm"
                />
                
                {/* File Upload */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button onClick={resetReading} variant="outline" className="flex-1 text-xs">
                      <Icon name="RotateCcw" size={14} />
                      <span className="ml-1">Сбросить</span>
                    </Button>
                    <Button onClick={() => setText('')} variant="outline" className="flex-1 text-xs">
                      <Icon name="Trash2" size={14} />
                      <span className="ml-1">Очистить</span>
                    </Button>
                  </div>
                  
                  {/* File and URL inputs */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.html"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline" 
                        className="flex-1 text-xs"
                        disabled={isLoading}
                      >
                        <Icon name="Upload" size={14} />
                        <span className="ml-1">Загрузить файл</span>
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Вставьте ссылку на текст..."
                        className="text-sm"
                      />
                      <Button 
                        onClick={handleUrlLoad}
                        variant="outline"
                        disabled={!urlInput.trim() || isLoading}
                        className="px-3"
                      >
                        {isLoading ? (
                          <Icon name="Loader2" size={14} className="animate-spin" />
                        ) : (
                          <Icon name="Link" size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Библиотека</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {sampleTexts.map((sample, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow animate-slide-up" 
                      onClick={() => loadSampleText(sample)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{sample.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{sample.author}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{sample.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {sample.content.slice(0, 80)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={10} />
                        {sample.words} слов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={10} />
                        {Math.ceil(sample.words / speed[0])} мин
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>


          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Темы</h2>
              <Badge variant="outline" className="text-xs">Текущая: {themes.find(t => t.id === currentTheme)?.name}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentTheme(theme.id)}
                >
                  <CardContent className="p-3">
                    <div className={`${theme.bg} ${theme.text} ${theme.border} border rounded-lg p-3 mb-2 min-h-[80px] flex items-center justify-center relative`}>
                      {showFocusLine && (
                        <div className="absolute left-2 right-2 h-0.5 bg-current opacity-30 top-1/2 transform -translate-y-1/2" />
                      )}
                      <div className="text-center">
                        <div className="text-lg font-medium">
                          {showCentralLetter ? (
                            <>
                              Сло<span className="text-primary font-semibold">в</span>о
                            </>
                          ) : (
                            'Слово'
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-center text-sm">{theme.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Статистика</h2>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">🇷🇺</SelectItem>
                  <SelectItem value="en">🇺🇸</SelectItem>
                  <SelectItem value="es">🇪🇸</SelectItem>
                  <SelectItem value="fr">🇫🇷</SelectItem>
                  <SelectItem value="de">🇩🇪</SelectItem>
                  <SelectItem value="zh">🇨🇳</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="BookOpen" size={16} />
                    Прочитано
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {wordsRead.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">слов</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Zap" size={16} />
                    Скорость
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-primary mb-1">{avgSpeed}</div>
                  <p className="text-xs text-muted-foreground">WPM</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon name="Target" size={16} />
                    Сессии
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-primary mb-1">{sessionsCompleted}</div>
                  <p className="text-xs text-muted-foreground">завершено</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="TrendingUp" size={18} />
                  Прогресс
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Начальный уровень</span>
                    <span>180 WPM</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Текущий уровень</span>
                    <span className="font-semibold">{avgSpeed} WPM</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <h4 className="font-semibold mb-2 text-sm">Достижения</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="default" className="p-2 justify-center text-xs">
                      🏆 Первые шаги
                    </Badge>
                    <Badge variant="default" className="p-2 justify-center text-xs">
                      🚀 Скорость
                    </Badge>
                    <Badge variant="outline" className="p-2 justify-center text-xs">
                      📚 Книголюб
                    </Badge>
                    <Badge variant="outline" className="p-2 justify-center text-xs">
                      ⚡ Молния
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t md:hidden">
        <div className="p-4 space-y-4">
          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" onClick={jumpBack} className="ios-button h-10 px-3">
              <Icon name="RotateCcw" size={16} />
              <span className="ml-1 text-xs">-5</span>
            </Button>
            <Button 
              onClick={playPause} 
              className="ios-button h-12 w-12 rounded-full"
              size="sm"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
            </Button>
            <Button variant="outline" size="sm" onClick={jumpForward} className="ios-button h-10 px-3">
              <Icon name="RotateCw" size={16} />
              <span className="ml-1 text-xs">+5</span>
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Скорость:</span>
              <span className="font-semibold">{speed[0]} WPM</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSpeed([Math.max(100, speed[0] - 25)])}
                className="ios-button h-8 w-8 p-0"
              >
                <Icon name="Minus" size={14} />
              </Button>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={100}
                max={1000}
                step={25}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSpeed([Math.min(1000, speed[0] + 25)])}
                className="ios-button h-8 w-8 p-0"
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
          </div>

          {/* Mobile Settings Row */}
          <div className="flex justify-between items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="ios-button">
                  <Icon name="Settings" size={16} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[400px]">
                <SheetHeader>
                  <SheetTitle>Настройки</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Слов в кадре</span>
                    <Select value={wordsPerFrame.toString()} onValueChange={(v) => setWordsPerFrame(parseInt(v))}>
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Центральная буква</span>
                    <Switch checked={showCentralLetter} onCheckedChange={setShowCentralLetter} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Верхний регистр</span>
                    <Switch checked={isUppercase} onCheckedChange={setIsUppercase} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Линия фокуса</span>
                    <Switch checked={showFocusLine} onCheckedChange={setShowFocusLine} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Tab Navigation */}
            <Tabs value="reader" className="flex-1 mx-4">
              <TabsList className="grid w-full grid-cols-4 h-8">
                <TabsTrigger value="reader" className="text-xs p-1">
                  <Icon name="Book" size={12} />
                </TabsTrigger>
                <TabsTrigger value="library" className="text-xs p-1">
                  <Icon name="Library" size={12} />
                </TabsTrigger>
                <TabsTrigger value="themes" className="text-xs p-1">
                  <Icon name="Palette" size={12} />
                </TabsTrigger>
                <TabsTrigger value="stats" className="text-xs p-1">
                  <Icon name="BarChart3" size={12} />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={() => setHideUI(true)} className="ios-button">
              <Icon name="Maximize" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;