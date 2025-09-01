import { TextChunk } from '../types';

export class TextProcessor {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  processText(text: string): string[] {
    // Split text into chunks of approximately 300 characters for more precise responses
    const chunkSize = 300;
    const chunks: string[] = [];
    
    // Split by paragraphs first, then by sentences
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim());
      
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;
        
        if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
        }
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  calculateRelevance(query: string, text: string): number {
    const queryTokens = this.tokenize(query);
    const textTokens = this.tokenize(text);
    
    if (queryTokens.length === 0 || textTokens.length === 0) {
      return 0;
    }
    
    let score = 0;
    const textTokenSet = new Set(textTokens);
    
    // Exact phrase matching (highest priority)
    if (text.toLowerCase().includes(query.toLowerCase())) {
      score += 150;
    }
    
    // Token matching with higher precision
    for (const token of queryTokens) {
      if (textTokenSet.has(token)) {
        score += 15;
        
        // Bonus for multiple occurrences
        const occurrences = textTokens.filter(t => t === token).length;
        score += Math.min(occurrences * 3, 15);
      }
    }
    
    // Proximity bonus for multiple query terms
    if (queryTokens.length > 1) {
      const textLower = text.toLowerCase();
      for (let i = 0; i < queryTokens.length - 1; i++) {
        const token1Pos = textLower.indexOf(queryTokens[i]);
        const token2Pos = textLower.indexOf(queryTokens[i + 1]);
        
        if (token1Pos !== -1 && token2Pos !== -1) {
          const distance = Math.abs(token1Pos - token2Pos);
          if (distance < 50) {
            score += 25 - (distance / 3);
          }
        }
      }
    }
    
    return score;
  }

  searchChunks(query: string, chunks: string[]): TextChunk[] {
    const results: TextChunk[] = chunks
      .map((chunk, index) => ({
        content: chunk,
        score: this.calculateRelevance(query, chunk),
        index
      }))
      .filter(chunk => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Limit to top 3 most relevant chunks
    
    return results;
  }

  generateResponse(query: string, relevantChunks: TextChunk[], mode: 'short' | 'detailed' = 'short'): string {
    if (relevantChunks.length === 0) {
      return "I couldn't find specific information to answer your question. Please try rephrasing or asking about a different topic.";
    }

    const queryLower = query.toLowerCase();

    // --- DETAILED MODE LOGIC ---
    if (mode === 'detailed') {
      // Use a Map to get unique chunks based on content, preserving order
      const uniqueChunks = [...new Map(relevantChunks.map(item => [item.content, item])).values()];
      
      const detailedContent = uniqueChunks
        .slice(0, 2) // Take the top 2 unique, relevant chunks
        .map(chunk => chunk.content)
        .join('\n\n...\n\n'); // Join them with a clear separator

      if (!detailedContent.trim()) {
        return "I found some related information, but couldn't form a detailed answer. Please try rephrasing.";
      }

      return `Here is the most relevant information I found:\n\n${detailedContent}`;
    }

    // --- SHORT MODE LOGIC ---
    // First, try for hyper-specific answers using regex on the combined content of top chunks.
    const combinedTopContent = relevantChunks.map(c => c.content).join(' ');

    if (queryLower.includes('who is') || queryLower.includes('who')) {
      const nameMatch = combinedTopContent.match(/(?:CEO|President|Manager|Director|Leader|Head):\s*([^,.\n]+)/i);
      if (nameMatch) return nameMatch[1].trim();
    }
    
    if (queryLower.includes('when') && queryLower.includes('founded')) {
      const foundedMatch = combinedTopContent.match(/Founded:\s*(\d{4})/i);
      if (foundedMatch) return foundedMatch[1];
    }
    
    if (queryLower.includes('where') || queryLower.includes('headquarters')) {
      const locationMatch = combinedTopContent.match(/Headquarters:\s*([^,.\n]+)/i);
      if (locationMatch) return locationMatch[1].trim();
    }
    
    if (queryLower.includes('how many') && queryLower.includes('employee')) {
      const employeeMatch = combinedTopContent.match(/Employees:\s*([^,.\n]+)/i);
      if (employeeMatch) return employeeMatch[1].trim();
    }
    
    if (queryLower.includes('revenue') || queryLower.includes('income')) {
      const revenueMatch = combinedTopContent.match(/Revenue[^:]*:\s*([^,.\n]+)/i);
      if (revenueMatch) return revenueMatch[1].trim();
    }

    // If no specific regex match, return the most relevant sentence from the top chunk.
    const topChunk = relevantChunks[0];
    const sentences = topChunk.content.split(/[.!?]+/).filter(s => s.trim());
    
    const relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return this.tokenize(query).some(token => sentenceLower.includes(token));
    });

    if (relevantSentences.length > 0) {
      return relevantSentences[0].trim() + '.';
    }

    // Fallback to the top chunk content if no relevant sentence is found
    return topChunk.content;
  }
}
