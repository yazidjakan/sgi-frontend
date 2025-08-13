import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  searchQuery = '';
  faqs: FAQ[] = [
    {
      id: 'create-ticket',
      category: 'tickets',
      question: 'Comment créer un nouveau ticket ?',
      answer: `<p>Pour créer un nouveau ticket :</p><ol><li>Cliquez sur <strong>"Mes tickets"</strong></li><li>Cliquez sur <strong>"Nouvelle carte"</strong></li><li>Remplissez le formulaire</li><li>Cliquez sur <strong>"Créer"</strong></li></ol>`,
      keywords: ['créer', 'nouveau', 'ticket', 'incident']
    },
    {
      id: 'ticket-status',
      category: 'tickets',
      question: 'Que signifient les statuts des tickets ?',
      answer: `<ul><li><strong>Backlog</strong> : En attente</li><li><strong>Ouvert</strong> : Pris en charge</li><li><strong>En cours</strong> : Résolution en cours</li><li><strong>À valider</strong> : Solution proposée</li><li><strong>Résolu</strong> : Terminé</li></ul>`,
      keywords: ['statut', 'état', 'backlog', 'ouvert']
    },
    {
      id: 'ticket-visibility',
      category: 'tickets',
      question: 'Qui peut voir mes tickets ?',
      answer: `<p>Vos tickets sont visibles par :</p><ul><li>Vous-même</li><li>Les techniciens assignés</li><li>Votre manager</li><li>Les administrateurs</li></ul>`,
      keywords: ['visibilité', 'voir', 'accès', 'permissions']
    },
    {
      id: 'change-password',
      category: 'account',
      question: 'Comment modifier mon mot de passe ?',
      answer: `<ol><li>Cliquez sur votre avatar</li><li>Sélectionnez "Profil"</li><li>Section "Sécurité"</li><li>Modifiez votre mot de passe</li></ol>`,
      keywords: ['mot de passe', 'changer', 'modifier', 'sécurité']
    },
    {
      id: 'notifications',
      category: 'account',
      question: 'Comment gérer mes notifications ?',
      answer: `<p>Dans Configuration > Notifications, vous pouvez activer/désactiver les alertes pour les nouveaux tickets et changements de statut.</p>`,
      keywords: ['notifications', 'alertes', 'configuration']
    },
    {
      id: 'kanban-board',
      category: 'navigation',
      question: 'Comment utiliser le tableau Kanban ?',
      answer: `<p>Le Kanban organise vos tickets :</p><ul><li>Glissez-déposez entre colonnes</li><li>Utilisez la recherche pour filtrer</li><li>Cliquez pour voir les détails</li></ul>`,
      keywords: ['kanban', 'tableau', 'glisser', 'déposer']
    },
    {
      id: 'login-issues',
      category: 'troubleshooting',
      question: 'Problème de connexion ?',
      answer: `<ol><li>Vérifiez vos identifiants</li><li>Contrôlez le Caps Lock</li><li>Réinitialisez votre mot de passe</li><li>Essayez un autre navigateur</li></ol>`,
      keywords: ['connexion', 'login', 'problème', 'accès']
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onSearch(query: string): void {
    this.searchQuery = query.toLowerCase().trim();
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  getFilteredFAQs(category: string): FAQ[] {
    const categoryFAQs = this.faqs.filter(faq => faq.category === category);
    if (!this.searchQuery) return categoryFAQs;
    
    return categoryFAQs.filter(faq => 
      faq.question.toLowerCase().includes(this.searchQuery) ||
      faq.answer.toLowerCase().includes(this.searchQuery) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(this.searchQuery))
    );
  }

  getSearchResults(): FAQ[] {
    if (!this.searchQuery) return this.faqs;
    
    return this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(this.searchQuery) ||
      faq.answer.toLowerCase().includes(this.searchQuery) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(this.searchQuery))
    );
  }

  shouldShowSection(category: string): boolean {
    if (!this.searchQuery) return true;
    return this.getFilteredFAQs(category).length > 0;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  contactSupport(): void {
    this.router.navigate(['/tickets']);
  }
}