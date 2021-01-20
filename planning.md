## User stories

### Ärzte
* Registrieren / einloggen
* Praxis kann angelegt werden
* Praxis infos hinzufügen / bearbeiten
* Terminkalender zu Praxis hinzufügen? Einen pro Praxis oder mehrere?
* Termine zu Terminkalender hinzufügen
* Gebuchte Termine bearbeiten
(* Timeslots)

### Patienten

* Registrieren / einloggen
* Praxen suchen
* Freie Termine einer Praixs ansehen
* Termin einer Praxis buchen
* Eigene Termine ansehen / bearbeiten


## Datastructures

```json
doctors_office: {
	doctors_office_id
	avatar_id
	picture_ids
	profile_description
	opening_hours
	contact_info
	adress
	website_url
	appointment subcollection
	private subcollection with owner / manager roles
}
```

```json
appointment: {
	appointment_id
	user_id
	datetime
	type_of_insurance
	reason_for_visit
}
```

```json
user_appointments: {
	user_id
	appointments [{
		appointmend_id
		doctors_office_id
	}]
}
```

## Anmerkungen

### appointments als subcollection von doctors_office
* Braucht keinen composite index
* Security rules vermutlich leichter umzusetzen, z.B. praxis besitzer kann appointments in der Subcollection ändern, wenn er in doctors office als owner gelistet ist

### user_appointments als extra top-level collection
* Falls er ein appointment löschen will wird es über cloud functions aus der originalen collection gelöscht