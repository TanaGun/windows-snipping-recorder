import { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { invoke } from '@tauri-apps/api/core'
import {
  AppWindow, ArrowUpRight, Check, ChevronDown, CircleDot, Copy, Crop,
  FolderOpen, Image, LayoutGrid, Mic, Monitor, MonitorUp, MousePointer2,
  PenLine, Play, RectangleHorizontal, Save, Scissors, Settings, ShieldCheck,
  StopCircle, Timer, Type, Video, Volume2, Waves
} from 'lucide-react'
import './styles/app.css'

type CaptureSource = 'Region' | 'Window' | 'Full screen'
type Tool = 'Select' | 'Pen' | 'Arrow' | 'Rectangle' | 'Text' | 'Blur' | 'Crop'
type NativeCapture = { path: string; width: number; height: number }

const isTauri = () => '__TAURI_INTERNALS__' in window

const sources: { label: CaptureSource; icon: typeof Scissors; hint: string }[] = [
  { label: 'Region', icon: Scissors, hint: 'Drag to select an area' },
  { label: 'Window', icon: AppWindow, hint: 'Choose an app window' },
  { label: 'Full screen', icon: Monitor, hint: 'Capture display 1' },
]
const tools: { label: Tool; icon: typeof MousePointer2 }[] = [
  { label: 'Select', icon: MousePointer2 }, { label: 'Pen', icon: PenLine },
  { label: 'Arrow', icon: ArrowUpRight }, { label: 'Rectangle', icon: RectangleHorizontal },
  { label: 'Text', icon: Type }, { label: 'Blur', icon: Waves }, { label: 'Crop', icon: Crop },
]

function App() {
  const [source, setSource] = useState<CaptureSource>('Region')
  const [tool, setTool] = useState<Tool>('Select')
  const [delay, setDelay] = useState('No delay')
  const [showDelays, setShowDelays] = useState(false)
  const [systemAudio, setSystemAudio] = useState(true)
  const [microphone, setMicrophone] = useState(false)
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [toast, setToast] = useState('')
  const [page, setPage] = useState('Capture')
  const [capturing, setCapturing] = useState(false)
  const [nativeCapture, setNativeCapture] = useState<NativeCapture | null>(null)

  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setSeconds((v) => v + 1), 1000)
    return () => window.clearInterval(id)
  }, [recording])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(id)
  }, [toast])
  const duration = useMemo(() => `00:${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`, [seconds])
  const notify = (text: string) => setToast(text)
  const toggleRecording = () => {
    if (recording) { setRecording(false); notify('Prototype preview stopped — no media was created') }
    else { setSeconds(0); setRecording(true); notify('Prototype preview started — native recording is planned') }
  }
  const takeCapture = async () => {
    if (!isTauri()) { notify(`${source} capture requires the Windows desktop build`); return }
    if (source !== 'Full screen') { notify('This first native build supports Full screen. Region and Window are next.'); return }
    setCapturing(true)
    try {
      const result = await invoke<NativeCapture>('capture_screen')
      setNativeCapture(result)
      notify(`Saved ${result.width} × ${result.height} PNG locally`)
    } catch (error) {
      notify(`Capture failed: ${String(error)}`)
    } finally {
      setCapturing(false)
    }
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Scissors size={21}/></span><span>Snip<span>Record</span></span></div>
      <div className="nav-label">WORKSPACE</div>
      {[[Scissors, 'Capture'], [LayoutGrid, 'History'], [FolderOpen, 'Saved']].map(([Icon, label]) => <button key={String(label)} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => setPage(String(label))}><Icon size={18}/><span>{String(label)}</span></button>)}
      <div className="nav-label lower">PREFERENCES</div>
      <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => setPage('Settings')}><Settings size={18}/><span>Settings</span></button>
      <div className="privacy-card"><ShieldCheck size={18}/><div><b>Local only</b><small>Nothing leaves this PC</small></div></div>
      <div className="profile"><div className="avatar">TP</div><div><b>Tanakom</b><small>Windows 11</small></div><ChevronDown size={15}/></div>
    </aside>

    <section className="workspace">
      <header><div><p className="eyebrow">{page === 'Capture' ? 'QUICK CAPTURE' : 'WORKSPACE'}</p><h1>{page === 'Capture' ? 'Capture your screen' : page}</h1><p className="subhead">{page === 'Capture' ? 'Select a capture type, then edit, copy, or save locally.' : 'Your local-only workspace.'}</p></div><div className="hotkey"><span><Scissors size={15}/> New snip</span><kbd>PrtSc</kbd></div></header>

      {page === 'Capture' ? <>
        <section className="capture-panel">
          <div className="section-heading"><div><h2>Take a capture</h2><p>Choose what you want to capture</p></div><button className="delay-button" onClick={() => setShowDelays(!showDelays)}><Timer size={16}/>{delay}<ChevronDown size={14}/></button>{showDelays && <div className="delay-menu">{['No delay', '3 seconds', '5 seconds', '10 seconds'].map(v => <button key={v} onClick={() => { setDelay(v); setShowDelays(false) }}>{v}{v === delay && <Check size={14}/>}</button>)}</div>}</div>
          <div className="source-grid">{sources.map(({ label, icon: Icon, hint }) => <button key={label} className={`source-card ${source === label ? 'selected' : ''}`} onClick={() => { setSource(label); notify(`${label} selected`) }}><span className="source-icon"><Icon size={23}/></span><b>{label}</b><small>{hint}</small>{source === label && <span className="selected-dot"><Check size={12}/></span>}</button>)}</div>
          <button className="start-capture" disabled={capturing} onClick={takeCapture}><Scissors size={18}/> {capturing ? 'Capturing…' : 'Start capture'} <kbd>↵</kbd></button>
        </section>

        <section className="editor-panel">
          <div className="editor-bar"><div><h2>Preview</h2><span className="file-pill"><Image size={14}/> {nativeCapture ? `Native PNG • ${nativeCapture.width} × ${nativeCapture.height}` : 'Prototype screenshot • 1920 × 1080'}</span></div><div className="editor-actions"><button className="icon-button" aria-label="Undo">↶</button><button className="icon-button" aria-label="Redo">↷</button><button className="save-button" onClick={() => notify('Save is planned for the native app')}><Save size={16}/> Save</button><button className="copy-button" onClick={() => notify('Clipboard copy is planned for the native app')}><Copy size={16}/> Copy</button></div></div>
          <div className="editor-body"><nav className="tool-rail">{tools.map(({ label, icon: Icon }) => <button key={label} className={tool === label ? 'tool-selected' : ''} onClick={() => { setTool(label); notify(`${label} tool active`) }} title={label}><Icon size={18}/></button>)}</nav><div className="canvas-wrap"><div className="fake-window"><div className="window-top"><span className="traffic"><i></i><i></i><i></i></span><span>Dashboard — Contoso</span><span className="window-icons">— □ ×</span></div><div className="fake-content"><div className="fake-side"><b>contoso</b><span className="fake-nav active-nav">Overview</span><span className="fake-nav">Analytics</span><span className="fake-nav">Customers</span><span className="fake-nav">Reports</span></div><div className="fake-main"><div className="fake-title"><div><em>Overview</em><h3>Good morning, Tanakom</h3></div><button>Export report</button></div><div className="metric-row">{[['$48,240','Revenue'],['1,284','Orders'],['24.8k','Visitors']].map(([n,l]) => <div className="metric" key={l}><small>{l}</small><b>{n}</b><span>↗ 12.4%</span></div>)}</div><div className="chart"><div className="chart-head"><b>Revenue overview</b><small>Last 30 days</small></div><svg viewBox="0 0 600 150" preserveAspectRatio="none"><path d="M0,128 C25,105 38,122 60,100 S100,110 120,75 S160,98 180,66 S220,80 245,48 S285,68 310,43 S350,59 375,30 S420,53 448,40 S485,58 515,25 S560,42 600,12 L600,150 L0,150Z" fill="url(#gradient)"/><path d="M0,128 C25,105 38,122 60,100 S100,110 120,75 S160,98 180,66 S220,80 245,48 S285,68 310,43 S350,59 375,30 S420,53 448,40 S485,58 515,25 S560,42 600,12" fill="none" stroke="#7c6dff" strokeWidth="3"/><defs><linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#7c6dff" stopOpacity=".45"/><stop offset="1" stopColor="#7c6dff" stopOpacity="0"/></linearGradient></defs></svg></div></div></div><div className="selection-box"><span>812 × 463</span><i className="h1"/><i className="h2"/><i className="h3"/><i className="h4"/></div></div></div></div></section>

        <section className="bottom-grid"><div className="record-card"><div className="record-head"><div><p className="eyebrow">SCREEN RECORDING</p><h2>{recording ? 'Recording in progress' : 'Record your screen'}</h2></div><span className={recording ? 'recording-badge live' : 'recording-badge'}><CircleDot size={13}/>{recording ? duration : 'Ready'}</span></div><div className="record-options"><button className="record-source active"><MonitorUp size={18}/><span>Display 1</span></button><button className="record-source"><AppWindow size={18}/><span>Window</span></button><button className="record-source"><Scissors size={18}/><span>Region</span></button></div><div className="audio-row"><button className={`audio-toggle ${systemAudio ? 'on' : ''}`} onClick={() => setSystemAudio(!systemAudio)}><span className="audio-icon"><Volume2 size={17}/></span><span><b>System audio</b><small>Speakers (Realtek)</small></span><i className="meter"><u></u><u></u><u></u><u></u><u></u></i><span className="switch"><em></em></span></button><button className={`audio-toggle ${microphone ? 'on' : ''}`} onClick={() => setMicrophone(!microphone)}><span className="audio-icon"><Mic size={17}/></span><span><b>Microphone</b><small>Off</small></span><span className="switch"><em></em></span></button></div><div className="record-footer"><div className="format-toggle"><button className="format-active">MP4</button><button>GIF</button><span>60 FPS</span></div><button className={`record-button ${recording ? 'stop' : ''}`} onClick={toggleRecording}>{recording ? <StopCircle size={18}/> : <Video size={18}/>} {recording ? 'Stop preview' : 'Preview recording'}</button></div></div><div className="recent-card"><div className="recent-head"><div><h2>Recent captures</h2><p>Prototype examples — no files created</p></div><button onClick={() => setPage('History')}>View all <ArrowUpRight size={14}/></button></div>{[['Dashboard overview','PNG','Today, 10:42'], ['Product demo','MP4','Yesterday, 16:18'], ['Checkout flow','PNG','Aug 8, 09:24']].map(([name, type, time], i) => <div className="recent-item" key={name}><div className={`thumb thumb-${i}`}><span>{type === 'MP4' ? <Play size={14} fill="white"/> : <Image size={15}/>}</span></div><div><b>{name}</b><small>{type} • {time}</small></div><button className="more">•••</button></div>)}</div></section>
      </> : <section className="empty-view"><Scissors size={32}/><h2>{page} is local to this PC</h2><p>This prototype focuses on the Capture workflow. Select Capture to create a new snip.</p><button onClick={() => setPage('Capture')}>Go to Capture</button></section>}
    </section>
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </main>
}

createRoot(document.getElementById('root')!).render(<App />)
