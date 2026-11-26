import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type SpecialtyType =
  | 'HARMONIZACAO'
  | 'CLAREAMENTO'
  | 'ODONTOLOGIA'
  | 'PREENCHIMENTO_LABIAL'
  | 'BOTOX'
  | 'BICHECTOMIA';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  readonly id: string;
  readonly userId: string;
  readonly userName: string;
  readonly scheduledAt: string;
  readonly specialty: SpecialtyType;
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly createdAt: string;
}

export interface CreateAppointmentRequest {
  readonly scheduledAt: string;
  readonly specialty: SpecialtyType;
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

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API_BASE}/appointments`);
  }

  updateStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string
  ): Observable<Appointment> {
    return this.http.put<Appointment>(`${API_BASE}/appointments/${id}/status`, {
      status,
      ...(notes ? { notes } : {}),
    });
  }

  getOccupiedSlots(dateIso: string): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/appointments/occupied`, {
      params: { date: dateIso },
    });
  }

  cancel(id: string): Observable<Appointment> {
    return this.updateStatus(id, 'CANCELLED');
  }
}
