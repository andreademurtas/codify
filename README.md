# Codify

[![CI/CD Pipeline](https://github.com/andreademurtas/codify/actions/workflows/workflow.yml/badge.svg)](https://github.com/andreademurtas/codify/actions/workflows/workflow.yml)

Codify è un'applicazione web dove puoi allenarti a risolvere problemi di informatica in vari linguaggi.

## Schema del progetto
![](https://raw.githubusercontent.com/andreademurtas/codify/main/diagrammaprogettoreti.png)

## Soddisfacimento dei requisiti
- Il progetto fornisce un'API REST effettuare varie operazioni sugli utenti (reperire informazioni, creare, modificare, eliminare).
  L'API è documentata con apidoc.
- L'applicazione si interfaccia con JDoodle attraverso la sua API per rendere possibile l'esecuzione di codice in maniera interattiva.
- L'applicazione si interfaccia con Google Calendar attraverso la sua API per rendere possibile la creazione di promemoria per l'allenamento.
- L'applicazione utilizza RabbitMQ per far comunicare in maniera asincrona il server principale con un'istanza Nodejs che utlizza Nodemailer
  per iniviare un'email di conferma della registrazione agli utenti.
- L'applicazione utilizza Docker per la containerizzazione delle varie componenti e Docker Compose per l'orchestrazione delle stesse.
- E' implementata una procedura di CI/CD attraverso Github Actions, che prevede il deployment su un server EC2 (AWS) e esecuzione di test
  implementati grazie a Mochajs e Chaijs

## Installazione ed esecuzione
- git clone della repository
- nella directory principale esegui: 
  
  ```bash 
    scripts/docker_pipeline.sh
  
  ```
- da browser visita ![localhost](https://localhost)
- Scegli se registrarti o effettuare il login
- Seleziona uno dei problemi e mettiti alla prova
- Guarda il tuo profilo per vedere quanti punti hai acquisito 

## Test 
Per testare l'applicazione una volta avviata, assicurarsi di aver installato sia Nodejs che npm, quindi posizionarsi nella root directory ed eseguire:
```bash
npm install -g mocha && npm install && npm test
```

Attenzione: si potrebbero riscontrare problemi di autorizzazioni. In questo caso, provare con:
```bash
sudo npm install -g mocha && npm install && npm test
```

Una volta concluso lo step precedente, per far partire i test digitare:
```bash
mocha
```
