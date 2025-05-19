// src/minigames/InternetTroubleshootGame.ts

import { IMinigame } from './IMinigame';

interface Component {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  typo: string;
  correct: string;
  hint: string;
  fixed: boolean;
}

type Phase = 'inspect' | 'fixing' | 'complete';

export class InternetTroubleshootGame implements IMinigame {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private onComplete!: () => void;

  private comps: Component[] = [];
  private phase: Phase = 'inspect';
  private startTime = 0;
  private endTime = 0;

  constructor() {}

  public init(canvas: HTMLCanvasElement, onComplete: () => void): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onComplete = onComplete;
    this.setupComponents();
    this.startTime = performance.now();
    canvas.addEventListener('click', this.onClick);
  }

  public update(dt: number): void {
    // no continuous animation
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    if (this.phase === 'inspect') {
      this.renderInspect(ctx);
    } else if (this.phase === 'complete') {
      this.renderComplete(ctx);
    }
  }

  public destroy(): void {
    this.canvas.removeEventListener('click', this.onClick);
  }

  private setupComponents(): void {
    const compSize = 100;
    const spacing = 40;
    const topMargin = 120;
    const sideMargin = 50;

    const labels = [
      {
        id: 'router',
        label: 'Router',
        typo: 'routre',
        correct: 'router',
        hint: 'Routers are fundamental network devices that forward data packets between computer networks. In the context of the early Internet (ARPANET), "Interface Message Processors" (IMPs) performed routing functions. The concept of dedicated routers evolved, becoming essential for connecting disparate networks and enabling the global Internet. Early routing protocols like RIP (Routing Information Protocol) were developed in the 1980s.',
      },
      {
        id: 'switch',
        label: 'Switch',
        typo: 'swich',
        correct: 'switch',
        hint: 'Network switches, evolving from simpler bridges in the late 1980s and early 1990s, significantly improved Local Area Network (LAN) performance. Unlike hubs that broadcast data to all ports, switches learn MAC addresses and forward data only to the intended recipient port. This reduced collisions and increased available bandwidth, becoming a standard component in Ethernet networks.',
      },
      {
        id: 'cable',
        label: 'Cable',
        typo: 'cabel',
        correct: 'cable',
        hint: 'The physical medium for data transmission in early networks included thick and thin coaxial cables (for 10BASE5 and 10BASE2 Ethernet) and various types of twisted-pair copper wiring. The standardization of unshielded twisted pair (UTP) cabling, like Category 3 (Cat3) in the late 1980s, was crucial for the widespread adoption of 10BASE-T Ethernet, making network installation more flexible and cost-effective.',
      },
      {
        id: 'dns',
        label: 'DNS Server',
        typo: 'DN Server',
        correct: 'DNS Server',
        hint: 'The Domain Name System (DNS), introduced by Paul Mockapetris in 1983, was a critical innovation for the scaling Internet. It replaced the earlier system of maintaining a single HOSTS.TXT file for name-to-address resolution. DNS provided a hierarchical, distributed database system to translate human-readable domain names (e.g., www.example.com) into numerical IP addresses, making the internet vastly more user-friendly and manageable.',
      },
      {
        id: 'cloud',
        label: 'Data Center',
        typo: 'Data Cneter',
        correct: 'Data Center',
        hint: 'While the term "cloud" is modern, the concept of centralized computing resources dates back to mainframes. In the 1980s, "data centers" or "computer rooms" housed large, powerful systems like IBM mainframes or DEC VAX minicomputers. These facilities required specialized environments (cooling, power) and were the hubs for corporate and academic networks, running critical applications and databases long before the public internet boom.',
      },
      {
        id: 'tcp',
        label: 'TCP Protocol',
        typo: 'TC Protocol',
        correct: 'TCP Protocol',
        hint: 'Transmission Control Protocol (TCP), along with Internet Protocol (IP), forms the core suite of Internet protocols (TCP/IP). Developed by Vint Cerf and Bob Kahn in the 1970s, TCP was formally standardized in RFC 793 in 1981. It provides reliable, ordered, and error-checked delivery of a stream of octets between applications running on hosts communicating over an IP network. Its adoption by ARPANET in 1983 was a key moment in the formation of the modern Internet.',
      }
    ];

    const availableWidth = this.canvas.width - 2 * sideMargin;
    const itemsPerRow = Math.max(1, Math.floor(availableWidth / (compSize + spacing)));
    const totalItemWidth = itemsPerRow * compSize + (itemsPerRow - 1) * spacing;
    const startXOffset = (this.canvas.width - totalItemWidth) / 2;

    this.comps = labels.map((d, i) => {
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);
      return {
        id: d.id,
        label: d.label,
        typo: d.typo,
        correct: d.correct,
        hint: d.hint,
        w: compSize,
        h: compSize,
        x: startXOffset + col * (compSize + spacing),
        y: topMargin + row * (compSize + spacing + 20),
        fixed: false
      };
    });
  }

  private renderInspect(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, this.canvas.width, 60);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Internet Down - Click or Tap Components to Inspect', this.canvas.width / 2, 40);
    const progressBarY = 70;
    const progressBarHeight = 15;
    const pbWidth = this.canvas.width * 0.8;
    const pbX = (this.canvas.width - pbWidth) / 2;
    ctx.fillStyle = '#555'; ctx.fillRect(pbX, progressBarY, pbWidth, progressBarHeight);
    const fixedCount = this.comps.filter(c => c.fixed).length;
    const pct = fixedCount / this.comps.length;
    ctx.fillStyle = '#0f0'; ctx.fillRect(pbX, progressBarY, pbWidth * pct, progressBarHeight);
    this.comps.forEach(c => {
      ctx.save();
      ctx.globalAlpha = c.fixed ? 0.5 : 1;
      ctx.fillStyle = '#444'; ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2);
      ctx.restore();
    });
  }

  private renderComplete(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Internet Foundations Restored!', this.canvas.width / 2, 100);

    const secs = ((this.endTime - this.startTime) / 1000).toFixed(2);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Debugging Time: ${secs} seconds`, this.canvas.width / 2, 150);

    const history = [
      "The 1980s were a transformative period for computer networking, laying the critical groundwork for the Internet as we know it. The decade began with ARPANET, a U.S. Department of Defense research network, connecting a few hundred computers. By its end, the nascent Internet connected over 100,000 computers across various academic, research, and commercial networks.",
      "A pivotal moment was January 1, 1983, when ARPANET officially switched from NCP (Network Control Protocol) to the TCP/IP protocol suite. This provided a universal language for different computer networks to communicate, enabling true interoperability. The National Science Foundation Network (NSFNET), launched in 1985, initially connected supercomputer centers at 56 kbit/s and rapidly evolved, eventually forming a major backbone of the expanding Internet.",
      "Email quickly became the 'killer app' of this era. SMTP (Simple Mail Transfer Protocol) was standardized in 1982 (RFC 821), providing a reliable way to exchange electronic mail. The introduction of the Domain Name System (DNS) in 1983 by Paul Mockapetris was another crucial development, replacing the cumbersome centralized HOSTS.TXT file with a distributed, hierarchical naming system that could scale with the Internet's growth.",
      "Beyond email, other foundational application-layer protocols emerged and gained traction: FTP (File Transfer Protocol) for transferring files, Telnet for remote terminal access to computers, and NNTP (Network News Transfer Protocol) for Usenet newsgroups, which became vibrant online discussion forums. These protocols defined many of the core functionalities users expected from a networked environment.",
      "While Tim Berners-Lee wouldn't invent the World Wide Web until 1989 (with its public debut in the early 1990s), the technological and infrastructural advancements of the 1980s were indispensable prerequisites. The decade's emphasis on open standards, packet switching, and robust protocols like TCP/IP created the resilient and scalable foundation upon which the web revolution was built, ultimately democratizing access to information and global communication."
    ].join(' ');

    ctx.font = '16px sans-serif';
    this.wrapText(history, this.canvas.width - 120).forEach((line, i) => {
      ctx.fillText(line, this.canvas.width / 2, 200 + i * 24);
    });

    const bw = 200, bh = 50;
    const bx = (this.canvas.width - bw) / 2, by = this.canvas.height - 100;
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.fillText('Return to Island', this.canvas.width / 2, by + 32);
  }

  private onClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this.phase === 'inspect') {
      for (const c of this.comps) {
        if (!c.fixed && x>=c.x && x<=c.x+c.w && y>=c.y && y<=c.y+c.h) {
          const ans = window.prompt(`Fix typo for ${c.label}: "${c.typo}"\nHint: ${c.hint}`);
          if (ans?.trim() === c.correct) {
            c.fixed = true;
            if (this.comps.every(comp => comp.fixed)) {
              this.phase = 'complete';
              this.endTime = performance.now();
            }
          } else {
            alert(`Incorrect! Should be: ${c.correct}`);
          }
          return;
        }
      }
    } else if (this.phase === 'complete') {
      const bw=200, bh=50;
      const bx=(this.canvas.width-bw)/2, by=this.canvas.height-100;
      if (x>=bx && x<=bx+bw && y>=by && y<=by+bh) {
        this.onComplete();
      }
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (this.ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}