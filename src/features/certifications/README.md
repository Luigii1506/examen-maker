# Feature: Certifications

Certification management system for AML system users.

## Functionalities

### For Users

- View obtained certifications
- Download certificates in PDF
- Verify certification authenticity
- View progress toward new certifications
- Renew expired certifications

### Main Components

- **CertificationsView**: Main view with certification list
- **CertificateViewer**: Individual certificate viewer
- **CertificationProgress**: Progress indicator toward certifications
- **CertificateVerifier**: Public verification tool

## Integration

Integrates with:

- `exams`: To validate completed requirements
- `user-profile`: To show achievements and progress
- `admin-certifications`: To get templates and configurations
