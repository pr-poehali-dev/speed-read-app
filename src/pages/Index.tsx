import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  
  // Stats
  const [wordsRead, setWordsRead] = useState(1247);
  const [avgSpeed, setAvgSpeed] = useState(285);
  const [sessionsCompleted, setSessionsCompleted] = useState(12);
  const [readingProgress, setReadingProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Themes
  const themes = [
    { id: 'light', name: 'Classic Light', bg: 'bg-white', text: 'text-black' },
    { id: 'dark', name: 'Classic Dark', bg: 'bg-black', text: 'text-white' },
    { id: 'sepia', name: 'Sepia Print', bg: 'bg-amber-50', text: 'text-amber-900' },
    { id: 'comfort', name: 'Eye Comfort', bg: 'bg-green-50', text: 'text-green-900' },
    { id: 'contrast', name: 'High Contrast', bg: 'bg-gray-900', text: 'text-yellow-400' },
    { id: 'minimal', name: 'Minimal Pro', bg: 'bg-gray-50', text: 'text-gray-800' }
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

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  if (hideUI) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center relative ${currentThemeData.bg} ${currentThemeData.text} cursor-pointer`}
        onClick={() => setHideUI(false)}
      >
        <div className="relative">
          {showFocusLine && (
            <div className="focus-line top-1/2 transform -translate-y-1/2" />
          )}
          <div className="reading-word text-center px-8">
            {wordsPerFrame === 1 ? 
              getWordWithHighlight(getCurrentWords()) : 
              getCurrentWords()
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Icon name="Book" size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SpeedRead</h1>
            <p className="text-sm text-muted-foreground">Improve Your Reading Speed</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="animate-fade-in">
            {speed[0]} WPM
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setHideUI(true)}>
            <Icon name="Maximize" size={16} />
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="reader" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="reader">Чтение</TabsTrigger>
            <TabsTrigger value="library">Библиотека</TabsTrigger>
            <TabsTrigger value="themes">Темы</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
          </TabsList>

          {/* Reader Tab */}
          <TabsContent value="reader" className="space-y-6">
            {/* Reading Window */}
            <Card className={`${currentThemeData.bg} ${currentThemeData.text} min-h-[300px] animate-scale-in`}>
              <CardContent className="flex flex-col h-[300px] p-8">
                {/* Progress */}
                <div className="mb-6">
                  <Progress value={readingProgress} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Слово {currentIndex + 1} из {words.length}</span>
                    <span>{Math.round(readingProgress)}%</span>
                  </div>
                </div>

                {/* Reading Area */}
                <div className="flex-1 flex items-center justify-center relative">
                  {showFocusLine && (
                    <div className="focus-line top-1/2 transform -translate-y-1/2" />
                  )}
                  <div className="reading-word text-center px-8">
                    {wordsPerFrame === 1 ? 
                      getWordWithHighlight(getCurrentWords()) : 
                      getCurrentWords()
                    }
                  </div>
                </div>

                {/* Transport Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button variant="outline" size="sm" onClick={jumpBack} className="ios-button">
                    <Icon name="RotateCcw" size={16} />
                    <span className="ml-1">-5</span>
                  </Button>
                  <Button 
                    onClick={playPause} 
                    className="ios-button h-12 w-12 rounded-full"
                    size="sm"
                  >
                    <Icon name={isPlaying ? "Pause" : "Play"} size={20} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={jumpForward} className="ios-button">
                    <Icon name="RotateCw" size={16} />
                    <span className="ml-1">+5</span>
                  </Button>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Текст для чтения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Вставьте текст для скоростного чтения..."
                  className="min-h-[120px] resize-none"
                />
                <div className="flex gap-2 mt-3">
                  <Button onClick={resetReading} variant="outline" className="ios-button">
                    <Icon name="RotateCcw" size={16} />
                    <span className="ml-2">Сбросить</span>
                  </Button>
                  <Button onClick={() => setText('')} variant="outline" className="ios-button">
                    <Icon name="Trash2" size={16} />
                    <span className="ml-2">Очистить</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Библиотека текстов</h2>
              <Button className="ios-button">
                <Icon name="Plus" size={16} />
                <span className="ml-2">Добавить текст</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleTexts.map((sample, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow animate-slide-up" 
                      onClick={() => loadSampleText(sample)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{sample.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{sample.author}</p>
                      </div>
                      <Badge variant="secondary">{sample.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {sample.content.slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="FileText" size={12} />
                        {sample.words} слов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        {Math.ceil(sample.words / speed[0])} мин
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Upload" size={20} />
                  Импорт документов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="ios-button h-20 flex-col gap-2">
                    <Icon name="File" size={24} />
                    <span className="text-xs">TXT</span>
                  </Button>
                  <Button variant="outline" className="ios-button h-20 flex-col gap-2">
                    <Icon name="FileText" size={24} />
                    <span className="text-xs">PDF</span>
                  </Button>
                  <Button variant="outline" className="ios-button h-20 flex-col gap-2">
                    <Icon name="Book" size={24} />
                    <span className="text-xs">EPUB</span>
                  </Button>
                  <Button variant="outline" className="ios-button h-20 flex-col gap-2">
                    <Icon name="Link" size={24} />
                    <span className="text-xs">URL</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Темы оформления</h2>
              <Badge variant="outline">Текущая: {themes.find(t => t.id === currentTheme)?.name}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentTheme(theme.id)}
                >
                  <CardContent className="p-4">
                    <div className={`${theme.bg} ${theme.text} rounded-lg p-4 mb-3 min-h-[120px] flex items-center justify-center relative`}>
                      {showFocusLine && (
                        <div className="absolute left-4 right-4 h-0.5 bg-current opacity-30 top-1/2 transform -translate-y-1/2" />
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-medium">
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
                    <h3 className="font-semibold text-center">{theme.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Статистика прогресса</h2>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">🇷🇺 RU</SelectItem>
                  <SelectItem value="en">🇺🇸 EN</SelectItem>
                  <SelectItem value="es">🇪🇸 ES</SelectItem>
                  <SelectItem value="fr">🇫🇷 FR</SelectItem>
                  <SelectItem value="de">🇩🇪 DE</SelectItem>
                  <SelectItem value="zh">🇨🇳 ZH</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="animate-fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="BookOpen" size={20} />
                    Всего прочитано
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {wordsRead.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">слов</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Zap" size={20} />
                    Средняя скорость
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-1">{avgSpeed}</div>
                  <p className="text-sm text-muted-foreground">WPM</p>
                </CardContent>
              </Card>

              <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Target" size={20} />
                    Сессий завершено
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-1">{sessionsCompleted}</div>
                  <p className="text-sm text-muted-foreground">тренировок</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} />
                  Прогресс скорости чтения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Начальный уровень</span>
                    <span className="text-sm">180 WPM</span>
                  </div>
                  <Progress value={65} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Текущий уровень</span>
                    <span className="text-sm font-semibold">{avgSpeed} WPM</span>
                  </div>
                  <Progress value={85} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Цель</span>
                    <span className="text-sm">400 WPM</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Достижения</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Badge variant="default" className="p-2 justify-center">
                      🏆 Первые шаги
                    </Badge>
                    <Badge variant="default" className="p-2 justify-center">
                      🚀 Скоростной режим
                    </Badge>
                    <Badge variant="outline" className="p-2 justify-center">
                      📚 Книголюб
                    </Badge>
                    <Badge variant="outline" className="p-2 justify-center">
                      ⚡ Молния
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;