import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly scheduledAt: string;
  readonly specialty: 'ODONTOLOGIA' | 'HARMONIZACAO';
  readonly status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  readonly notes?: string;
  readonly createdAt: string;
}

export interface CreateAppointmentRequest {
  readonly scheduledAt: string;
  readonly specialty: 'ODONTOLOGIA' | 'HARMONIZACAO';
  readonly notes?: string;
}

const API_BASE = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly http = inject(HttpClient);

  create(data: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${API_BASE}/appointments`, data);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API_BASE}/appointments/me`);
  }
}
