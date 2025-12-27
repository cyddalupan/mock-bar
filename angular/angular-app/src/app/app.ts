import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule], // Add CommonModule and FormsModule here
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Mock Bar App');

  dbData: any[] = [];
  dbError: string | null = null;
  dbLoading: boolean = false;

  aiSystemPrompt: string = 'You are a helpful assistant.';
  aiHistory: { role: string; content: string }[] = [];
  aiUserMessage: string = '';
  aiResponse: any = null;
  aiError: string | null = null;
  aiLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Optionally fetch DB data on init
    // this.fetchDbData();
  }

  fetchDbData(): void {
    this.dbLoading = true;
    this.dbError = null;
    const query = 'SELECT id, user_id, batch_id, question_id, answer, score, feedback, date_created FROM diag_ans LIMIT 10';
    this.apiService.getDbData(query).subscribe({
      next: (data) => {
        this.dbData = data;
        this.dbLoading = false;
      },
      error: (err) => {
        console.error('Error fetching DB data:', err);
        this.dbError = typeof err === 'string' ? err : JSON.stringify(err);
        this.dbLoading = false;
      }
    });
  }

  sendAiMessage(): void {
    if (!this.aiUserMessage.trim()) {
      return;
    }

    this.aiLoading = true;
    this.aiError = null;
    
    // Add user message to history for display
    this.aiHistory.push({ role: 'user', content: this.aiUserMessage });
    const currentHistory = [...this.aiHistory]; // Send current history
    const systemPrompt = this.aiSystemPrompt; // Use the current system prompt

    this.apiService.callAI(systemPrompt, currentHistory).subscribe({
      next: (response) => {
        this.aiResponse = response;
        if (response && response.choices && response.choices.length > 0) {
          const assistantMessage = response.choices[0].message.content;
          this.aiHistory.push({ role: 'assistant', content: assistantMessage });
        }
        this.aiUserMessage = ''; // Clear user input
        this.aiLoading = false;
      },
      error: (err) => {
        console.error('Error calling AI:', err);
        this.aiError = typeof err === 'string' ? err : JSON.stringify(err);
        this.aiLoading = false;
      }
    });
  }
}