// Always use API-backed services

// API services
import { ApiBoatService } from './api/ApiBoatService';
import { ApiUserService } from './api/ApiUserService';
import { ApiBookingService } from './api/ApiBookingService';
import { ApiAuthService } from './api/ApiAuthService';
import { ApiAvailabilityService } from './api/ApiAvailabilityService';
import { ApiAdminDashboardService } from './api/ApiAdminDashboardService';
import { ApiRenterDashboardService } from './api/ApiRenterDashboardService';
import { ApiOwnerDashboardService } from './api/ApiOwnerDashboardService';
import { ApiDestinationService } from './api/ApiDestinationService';
import { ApiHomeService } from './api/ApiHomeService';
import { ApiMessageService } from './api/ApiMessageService';
import { ApiUserDocumentService } from './api/ApiUserDocumentService';
import { ApiAdminUsersService } from './api/ApiAdminUsersService';

// Singleton factory to expose the correct service instances depending on config
const boatService = new ApiBoatService();
const userService = new ApiUserService();
const bookingService = new ApiBookingService();
const authService = new ApiAuthService();
const availabilityService = new ApiAvailabilityService();
const adminService = new ApiAdminDashboardService();
const renterDashboardService = new ApiRenterDashboardService();
const ownerDashboardService = new ApiOwnerDashboardService();
const homeService = new ApiHomeService();
const destinationService = new ApiDestinationService();
const messageService = new ApiMessageService();
const userDocumentService = new ApiUserDocumentService();
const adminUsersService = new ApiAdminUsersService();

export {
  boatService,
  userService,
  bookingService,
  authService,
  availabilityService,
  adminService,
  renterDashboardService,
  ownerDashboardService,
  homeService,
  messageService,
  destinationService,
  userDocumentService,
  adminUsersService,
};

export default {
  boatService,
  userService,
  bookingService,
  authService,
  availabilityService,
  adminService,
  renterDashboardService,
  ownerDashboardService,
  homeService,
  messageService,
  destinationService,
  userDocumentService,
  adminUsersService,
};
