import { MiniGameBase } from './MiniGameBase';

interface HardwarePart {
  id: string;
  name: string;
  description: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  matched: boolean;
}

interface HardwareFunction {
  id: string;
  description: string;
  correctPartId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class HardwarePuzzle extends MiniGameBase {
  private hardwareParts: HardwarePart[] = [];
  private hardwareFunctions: HardwareFunction[] = [];
  private selectedPart: HardwarePart | null = null;
  private matches: number = 0;
  private requiredMatches: number = 0;
  private gameTime: number = 120; // 2 minutes
  private timeRemaining: number = 120;
  private gameStarted: boolean = false;
  
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.setupGame();
  }
  
  private setupGame(): void {
    // Hardware parts data (iconic '80s computer components)
    const parts: Omit<HardwarePart, 'x' | 'y' | 'width' | 'height' | 'matched'>[] = [
      {
        id: 'processor',
        name: 'CPU (8088)',
        description: 'The brain of the computer that executes instructions',
        image: 'cpu' // These would be real sprite IDs in a full implementation
      },
      {
        id: 'memory',
        name: 'RAM Chips',
        description: 'Temporary memory for running programs',
        image: 'ram'
      },
      {
        id: 'diskdrive',
        name: '5.25" Floppy Drive',
        description: 'Reads and writes data to 5.25" floppy disks',
        image: 'floppy'
      },
      {
        id: 'keyboard',
        name: 'Keyboard Controller',
        description: 'Processes input from the keyboard',
        image: 'keyboard'
      },
      {
        id: 'video',
        name: 'CGA Card',
        description: 'Generates color graphics for the monitor',
        image: 'cga'
      },
      {
        id: 'motherboard',
        name: 'Motherboard',
        description: 'The main circuit board that connects all components',
        image: 'motherboard'
      }
    ];
    
    // Corresponding functions
    const functions: Omit<HardwareFunction, 'x' | 'y' | 'width' | 'height'>[] = [
      {
        id: 'function_cpu',
        description: 'Processes all calculations and executes program instructions',
        correctPartId: 'processor'
      },
      {
        id: 'function_ram',
        description: 'Stores data that is actively being used by programs',
        correctPartId: 'memory'
      },
      {
        id: 'function_storage',
        description: 'Allows for reading and writing data to removable media',
        correctPartId: 'diskdrive'
      },
      {
        id: 'function_input',
        description: 'Translates key presses into data the computer can understand',
        correctPartId: 'keyboard'
      },
      {
        id: 'function_display',
        description: 'Creates visual output for the computer monitor',
        correctPartId: 'video'
      },
      {
        id: 'function_connect',
        description: 'Connects all components together and provides power distribution',
        correctPartId: 'motherboard'
      }
    ];
    
    this.requiredMatches = parts.length;
    
    // Position parts on the left side of the screen
    const partWidth = 100;
    const partHeight = 60;
    const partMargin = 20;
    const partsStartY = 100;
    
    parts.forEach((part, index) => {
      this.hardwareParts.push({
        ...part,
        x: partMargin,
        y: partsStartY + index * (partHeight + partMargin),
        width: partWidth,
        height: partHeight,
        matched: false
      });
    });
    
    // Position functions on the right side of the screen
    const functionWidth = 200;
    const functionHeight = 60;
    const functionMargin = 20;
    const functionsStartY = 100;
    
    // Shuffle the functions to make the game more challenging
    const shuffledFunctions = [...functions].sort(() => Math.random() - 0.5);
    
    shuffledFunctions.forEach((func, index) => {
      this.hardwareFunctions.push({
        ...func,
        x: this.width - functionWidth - partMargin,
        y: functionsStartY + index * (functionHeight + functionMargin),
        width: functionWidth,
        height: functionHeight
      });
    });
  }
  
  public start(): void {
    this.running = true;
    this.gameStarted = true;
    this.timeRemaining = this.gameTime;
    this.matches = 0;
    this.selectedPart = null;
    
    // Reset parts
    this.hardwareParts.forEach(part => {
      part.matched = false;
    });
  }
  
  public update(deltaTime: number): void {
    if (!this.running || !this.gameStarted) return;
    
    // Update timer
    this.timeRemaining -= deltaTime / 1000;
    
    // Check for game over conditions
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.complete(this.matches === this.requiredMatches);
    }
    
    // Check for win condition
    if (this.matches === this.requiredMatches) {
      this.complete(true);
    }
  }
  
  public render(): void {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.ctx.fillStyle = '#000080'; // '80s blue background
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw title
    this.ctx.font = "24px 'Press Start 2P'";
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Hardware Puzzle Challenge', this.width / 2, 50);
    
    // Draw instructions
    this.ctx.font = "12px 'Press Start 2P'";
    this.ctx.fillText('Match each hardware component to its function!', this.width / 2, 80);
    
    // Draw parts
    this.hardwareParts.forEach(part => {
      // Skip if matched
      if (part.matched) return;
      
      // Draw part box
      this.ctx.fillStyle = this.selectedPart === part ? '#FF00FF' : '#00FFFF';
      this.ctx.fillRect(part.x, part.y, part.width, part.height);
      
      // Draw part name
      this.ctx.fillStyle = '#000000';
      this.ctx.textAlign = 'left';
      this.ctx.font = "10px 'Press Start 2P'";
      this.ctx.fillText(part.name, part.x + 5, part.y + 20);
      
      // In a full implementation, we would draw the part image here
    });
    
    // Draw functions
    this.hardwareFunctions.forEach(func => {
      // Check if this function's part is already matched
      const isMatched = this.hardwareParts.find(
        part => part.id === func.correctPartId && part.matched
      );
      
      // Draw function box
      this.ctx.fillStyle = isMatched ? '#00FF00' : '#FFFF00';
      this.ctx.fillRect(func.x, func.y, func.width, func.height);
      
      // Draw function description
      this.ctx.fillStyle = '#000000';
      this.ctx.textAlign = 'left';
      this.ctx.font = "8px 'Press Start 2P'";
      
      // Split text to fit in the box
      const words = func.description.split(' ');
      let line = '';
      let lineHeight = 12;
      let y = func.y + 15;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = this.ctx.measureText(testLine);
        
        if (metrics.width > func.width - 10) {
          this.ctx.fillText(line, func.x + 5, y);
          line = word + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      });
      
      this.ctx.fillText(line, func.x + 5, y);
    });
    
    // Draw timer
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textAlign = 'right';
    this.ctx.font = "16px 'Press Start 2P'";
    this.ctx.fillText(`Time: ${Math.ceil(this.timeRemaining)}s`, this.width - 20, 30);
    
    // Draw score
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Matches: ${this.matches}/${this.requiredMatches}`, 20, 30);
    
    // Draw game over message if needed
    if (!this.running && this.gameStarted) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.textAlign = 'center';
      this.ctx.font = "24px 'Press Start 2P'";
      
      if (this.matches === this.requiredMatches) {
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillText('PUZZLE COMPLETE!', this.width / 2, this.height / 2 - 20);
        this.ctx.font = "16px 'Press Start 2P'";
        this.ctx.fillText(`You matched all ${this.requiredMatches} components!`, this.width / 2, this.height / 2 + 20);
      } else {
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillText('TIME\'S UP!', this.width / 2, this.height / 2 - 20);
        this.ctx.font = "16px 'Press Start 2P'";
        this.ctx.fillText(`You matched ${this.matches} of ${this.requiredMatches} components.`, this.width / 2, this.height / 2 + 20);
      }
      
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = "12px 'Press Start 2P'";
      this.ctx.fillText('Click to try again', this.width / 2, this.height / 2 + 60);
    }
  }
  
  public handleInput(type: string, event: Event): void {
    if (!this.running && !this.completed) return;
    
    if (type === 'click' && event instanceof MouseEvent) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
      
      if (!this.gameStarted) {
        this.start();
        return;
      }
      
      if (!this.running && this.completed) {
        // Restart game if completed
        this.reset();
        this.start();
        return;
      }
      
      // Check if clicking on a part
      for (const part of this.hardwareParts) {
        if (part.matched) continue;
        
        if (
          mouseX >= part.x &&
          mouseX <= part.x + part.width &&
          mouseY >= part.y &&
          mouseY <= part.y + part.height
        ) {
          this.selectedPart = part;
          return;
        }
      }
      
      // Check if clicking on a function (and a part is selected)
      if (this.selectedPart) {
        for (const func of this.hardwareFunctions) {
          if (
            mouseX >= func.x &&
            mouseX <= func.x + func.width &&
            mouseY >= func.y &&
            mouseY <= func.y + func.height
          ) {
            // Check if match is correct
            if (func.correctPartId === this.selectedPart.id) {
              // Correct match!
              this.selectedPart.matched = true;
              this.matches++;
              
              // Play success sound (would implement in full version)
              
              // Add points based on time remaining
              this.score += Math.ceil(this.timeRemaining);
            } else {
              // Incorrect match - add penalty
              this.timeRemaining = Math.max(0, this.timeRemaining - 5);
              
              // Play error sound (would implement in full version)
            }
            
            this.selectedPart = null;
            return;
          }
        }
      }
    }
  }
}
