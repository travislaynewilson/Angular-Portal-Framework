import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';



@Component({
	selector: 'app-forms',
	templateUrl: './forms.component.html',
	styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit {

	$email = new FormControl('', [
		Validators.required,
		Validators.email
	]);

	query: string;

	pokemonControl = new FormControl();
	pokemonMultiControl = new FormControl();
	pokemonMultiControl2 = new FormControl();

	pokemonGroups = [
		{
			name: 'Grass',
			pokemon: [
				{ value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
				{ value: 'oddish-1', viewValue: 'Oddish' },
				{ value: 'bellsprout-2', viewValue: 'Bellsprout' }
			]
		},
		{
			name: 'Water',
			pokemon: [
				{ value: 'squirtle-3', viewValue: 'Squirtle' },
				{ value: 'psyduck-4', viewValue: 'Psyduck' },
				{ value: 'horsea-5', viewValue: 'Horsea' }
			]
		},
		{
			name: 'Fire',
			disabled: true,
			pokemon: [
				{ value: 'charmander-6', viewValue: 'Charmander' },
				{ value: 'vulpix-7', viewValue: 'Vulpix' },
				{ value: 'flareon-8', viewValue: 'Flareon' }
			]
		},
		{
			name: 'Psychic',
			pokemon: [
				{ value: 'mew-9', viewValue: 'Mew' },
				{ value: 'mewtwo-10', viewValue: 'Mewtwo' },
			]
		}
	];

	constructor () { }

	ngOnInit() {
	}

}
