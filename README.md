# cloudFunction
Cloud Functions:
    Triggertyp: Cloud Firestore
    Event type: write
    Dokumentpfad: doctors-offices/{Id}
    Erweitert:
        Zugewiesener Speicher: 256MiB
        Zeitlimit: 60 Sekunden
        Maximale Anzahl an Funktionsinstanzen: 100
    Umgebungsvariablen:
        USER_PROJECT: 
            Beschreibung: Name des Storage Buckets
            default: 'cc-appointments-images', wenn Wert nicht angegeben
        USER_IMGSIZE:
            Beschreibung: Die Image Größe in Pixel, skaliert Bilder zum Würfel
            default: 400
        USER_URL:
            Beschreibung: URL des Load Balancers oder des Storage Buckets (Wichtig: trailing /)
            default: 'https://static.appointments.gq/'

# authApi
SQL:
    MySQL:
        Instanz-ID: userdb
        Root-Passwort: Generieren und speichern
        Datenbankversion: MySQL 5.7
    Datenbank:
        "userdb" anlegen

Artifact Registry:
    Folgende Befehle in Konsole ausführen:
        1. gcloud artifacts repositories create user-mapping --repository-format=docker --location=europe-west3 --description="Docker repository"
        2. gcloud builds submit --tag europe-west3-docker.pkg.dev/cc-appointments-303011/user-mapping/mapping-image:tag1

Cloud Run:
    Dienst erstellen:
        Dienstname: Beliebig
    Überarbeitung aus dem vorhandenen Container-Image bereitstellen:
        Container aus Artifact Registry auswählen ("mapping-image")
    Variablen:
        GW_URL: Google Pfad zum API Gateway
            z.B. appointments-api-gateway-9kwntilt.ew.gateway.dev
        DB_NAME: userdb
        DB_USER: Root oder eigenen Funktionsnutzer anlegen
        DB_PASS: Passwort des DB_USER
        CLOUD_SQL_CONNECTION_NAME: Google Pfad zur CLOUD_SQL Instanz
            z.B. cc-appointments-303011:europe-west3:userdb
    Verbindungen:
        Cloud SQL-Verbindungen: Google Pfad zur CLOUD_SQL Instanz
            z.B. cc-appointments-303011:europe-west3:userdb

