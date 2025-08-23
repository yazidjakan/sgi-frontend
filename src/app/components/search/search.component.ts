import { Component } from '@angular/core';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: Date;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  // Search properties
  searchQuery: string = '';
  hasSearched: boolean = false;
  searchResults: SearchResult[] = [];

  // Advanced filters
  showAdvancedFilters: boolean = false;
  selectedStatus: string = '';
  selectedPriority: string = '';
  assignedTo: string = '';
  createdDate: Date | null = null;

  // Search methods
  onSearchInput(event: any): void {
    // Handle real-time search input
    const query = event.target.value;
    if (query.length >= 3) {
      // Could implement debounced search here
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) return;
    
    this.hasSearched = true;
    // Mock search results - replace with actual API call
    this.searchResults = [
      {
        id: 123,
        title: 'Problème de connexion réseau',
        description: 'Les utilisateurs ne peuvent pas se connecter au réseau principal',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedTo: 'Jean Dupont',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 124,
        title: 'Imprimante en panne',
        description: 'L\'imprimante du bureau 3 ne fonctionne plus',
        status: 'OPEN',
        priority: 'MEDIUM',
        assignedTo: 'Marie Martin',
        createdAt: new Date('2024-01-16')
      }
    ];
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.hasSearched = false;
    this.searchResults = [];
  }

  // Advanced filters methods
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.assignedTo = '';
    this.createdDate = null;
  }

  applyFilters(): void {
    // Apply the advanced filters to the search
    this.performSearch();
  }
}


