import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonGraphViewerComponent } from './json-graph-viewer.component';

describe('JsonGraphViewerComponent', () => {
  let component: JsonGraphViewerComponent;
  let fixture: ComponentFixture<JsonGraphViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonGraphViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonGraphViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
