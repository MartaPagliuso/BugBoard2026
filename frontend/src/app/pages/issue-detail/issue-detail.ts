import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-issue-detail',
  template: `<p class="text-sm text-ink">Dettaglio issue: {{ id }}</p>`,
})
export class IssueDetail {
  private readonly route = inject(ActivatedRoute);
  readonly id = this.route.snapshot.paramMap.get('id');
}