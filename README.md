#  SGI Frontend - Système de Gestion des Incidents

[![Angular](https://img.shields.io/badge/Angular-16.0.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular%20Material-16.0.0-purple.svg)](https://material.angular.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table des matières

- [Description](#-description)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Structure du projet](#-structure-du-projet)
- [API Endpoints](#-api-endpoints)
- [Captures d'écran](#-captures-décran)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 Description

SGI Frontend est l'interface utilisateur moderne du **Système de Gestion des Incidents** développé avec Angular 16. Cette application web offre une expérience utilisateur intuitive pour la gestion complète des incidents, du suivi SLA, et de l'analyse prédictive.

### 🎨 Interface moderne
- Design Material Design avec Angular Material
- Interface responsive et accessible
- Navigation intuitive avec sidebar
- Thème personnalisé SGI

### 🔐 Sécurité
- Authentification JWT
- Gestion des rôles (Admin, Manager, Technicien, Utilisateur)
- Protection des routes avec Guards
- Intercepteurs HTTP pour les tokens

## ✨ Fonctionnalités

### 🔑 Authentification & Autorisation
- [x] Connexion sécurisée avec JWT
- [x] Gestion des rôles utilisateurs
- [x] Protection des routes par rôle
- [x] Déconnexion automatique

### 📊 Dashboard & Analytics
- [x] Tableau de bord avec KPIs
- [x] Graphiques interactifs (Chart.js)
- [x] Métriques de performance
- [x] Suivi SLA en temps réel

### 🎯 Gestion des Incidents
- [x] Tableau Kanban interactif
- [x] Création/modification d'incidents
- [x] Système de priorités
- [x] Historique des actions
- [x] Pièces jointes

### 📈 Rapports & Analytics
- [x] Génération de rapports PDF/Excel
- [x] Export CSV pour analyse
- [x] Templates de rapports personnalisables
- [x] Statistiques détaillées

### 🤖 IA & Prédictions
- [x] Prédiction de violations SLA
- [x] Analyse prédictive des incidents
- [x] Recommandations automatiques
- [x] Modèle ML intégré

### 🔔 Notifications
- [x] Notifications en temps réel
- [x] Emails automatiques
- [x] Templates personnalisables
- [x] Historique des notifications

## 🏗️ Architecture

```
src/
├── app/
│   ├── components/          # Composants Angular
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── kanban/         # Tableau Kanban
│   │   ├── login/          # Authentification
│   │   ├── notifications/  # Notifications
│   │   ├── predictions/    # IA & Prédictions
│   │   └── reports/        # Rapports
│   ├── models/             # Modèles TypeScript
│   ├── services/           # Services Angular
│   ├── guards/             # Guards de sécurité
│   └── interceptors/       # Intercepteurs HTTP
├── assets/                 # Ressources statiques
├── environments/           # Configuration
└── styles/                # Styles globaux
```

## 🛠️ Technologies utilisées

### Frontend
- **Angular 16** - Framework principal
- **TypeScript** - Langage de programmation
- **Angular Material** - Composants UI
- **RxJS** - Programmation réactive
- **Chart.js** - Graphiques interactifs
- **ngx-toastr** - Notifications toast
- **Moment.js** - Gestion des dates

### Outils de développement
- **Angular CLI** - Outils de développement
- **Angular CDK** - Composants de base
- **Angular Animations** - Animations
- **Angular Router** - Navigation

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Angular CLI** >= 16.0.0

## 🚀 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/yazidjakan/sgi-frontend.git
cd sgi-frontend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Vérifier l'installation**
```bash
ng version
```

## ⚙️ Configuration

### 1. Configuration des environnements

Éditez `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8075/api',           // Auth Service
  incidentApiUrl: 'http://localhost:8077/api',   // Incident Service
  slaApiUrl: 'http://localhost:8079/api',        // SLA Service
  notificationApiUrl: 'http://localhost:8080/api', // Notification Service
  reportApiUrl: 'http://localhost:8081/api',     // Report Service
  predictionApiUrl: 'http://localhost:5000/api'  // AI Prediction Service
};
```

### 2. Configuration du backend

Assurez-vous que votre backend Spring Boot est en cours d'exécution sur les ports configurés.

## 🏃‍♂️ Démarrage

### Mode développement
```bash
ng serve
```
L'application sera accessible sur `http://localhost:4200`




## 📁 Structure du projet

```
sgi-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   └── dashboard.component.scss
│   │   │   ├── kanban/
│   │   │   ├── login/
│   │   │   ├── notifications/
│   │   │   ├── predictions/
│   │   │   └── reports/
│   │   ├── models/
│   │   │   ├── auth.model.ts
│   │   │   ├── incident.model.ts
│   │   │   ├── sla.model.ts
│   │   │   ├── notification.model.ts
│   │   │   ├── report.model.ts
│   │   │   └── prediction.model.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── incident.service.ts
│   │   │   ├── sla.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── prediction.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   ├── app.component.ts
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── assets/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   └── styles/
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Endpoints

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription
- `GET /api/v1/auth/roles` - Rôles disponibles

### Incidents
- `GET /api/v1/incidents` - Liste des incidents
- `POST /api/v1/incidents` - Créer un incident
- `PUT /api/v1/incidents/{id}` - Modifier un incident
- `DELETE /api/v1/incidents/{id}` - Supprimer un incident

### SLA
- `GET /api/slas` - Liste des SLA
- `POST /api/slas` - Créer un SLA
- `GET /api/slas/violations` - Violations SLA

### Notifications
- `POST /api/v1/notifications/email` - Envoyer notification
- `GET /api/v1/notifications/email/{email}/unread` - Notifications non lues

### Rapports
- `POST /api/v1/reports` - Générer rapport
- `GET /api/v1/reports/incidents/csv` - Export CSV

### Prédictions
- `POST /api/predict` - Faire une prédiction
- `GET /api/model/info` - Informations modèle

## 📸 Captures d'écran

### Page de connexion
![Login](screenshots/login.png)




## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request


**JAKAN EL YAZID**
- GitHub: [@yazidjakan](https://github.com/yazidjakan)
- LinkedIn: [El Yazid JAKAN](https://www.linkedin.com/in/el-yazid-jakan/)



---

⭐ Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile !
