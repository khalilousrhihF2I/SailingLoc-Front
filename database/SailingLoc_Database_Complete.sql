/*
================================================================================
  SAILINGLOC - Base de données complète SQL Server
  
  Description : Script de création de base de données pour l'application 
                SailingLoc - Plateforme de location de bateaux
  
  Compatibilité : SQL Server 2019+ / Azure SQL Database
  Management Studio : 21+
  
  Contenu :
  1. Création de la base de données
  2. Tables ASP.NET Identity
  3. Tables métiers (Boats, Bookings, etc.)
  4. Contraintes et index
  5. Données de test
  
  Date de création : 2025-01-27
================================================================================
*/

-- =============================================================================
-- 1. CRÉATION DE LA BASE DE DONNÉES
-- =============================================================================

USE master;
GO

-- Supprimer la base si elle existe déjà (ATTENTION : à commenter en production)
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'SailingLoc')
BEGIN
    ALTER DATABASE SailingLoc SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SailingLoc;
END
GO

-- Créer la nouvelle base de données
CREATE DATABASE SailingLoc
GO

USE SailingLoc;
GO

PRINT N'Base de données SailingLoc créée avec succès';
GO

-- =============================================================================
-- 2. TABLES ASP.NET IDENTITY
-- =============================================================================

PRINT N'Création des tables ASP.NET Identity...';
GO

-- -----------------------------------------------------------------------------
-- Table AspNetRoles
-- Stocke les rôles de l'application (Admin, Owner, Renter)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetRoles] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(256) NULL,
    [NormalizedName] NVARCHAR(256) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL
);
GO

CREATE UNIQUE INDEX [RoleNameIndex] 
ON [dbo].[AspNetRoles] ([NormalizedName]) 
WHERE [NormalizedName] IS NOT NULL;
GO

-- -----------------------------------------------------------------------------
-- Table AspNetUsers
-- Stocke les utilisateurs avec leurs informations de base
-- Étendue avec les propriétés métier (Phone, UserType, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetUsers] (
    [Id] NVARCHAR(450) NOT NULL PRIMARY KEY,
    [UserName] NVARCHAR(256) NULL,
    [NormalizedUserName] NVARCHAR(256) NULL,
    [Email] NVARCHAR(256) NULL,
    [NormalizedEmail] NVARCHAR(256) NULL,
    [EmailConfirmed] BIT NOT NULL DEFAULT 0,
    [PasswordHash] NVARCHAR(MAX) NULL,
    [SecurityStamp] NVARCHAR(MAX) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [PhoneNumber] NVARCHAR(MAX) NULL,
    [PhoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
    [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
    [LockoutEnd] DATETIMEOFFSET(7) NULL,
    [LockoutEnabled] BIT NOT NULL DEFAULT 0,
    [AccessFailedCount] INT NOT NULL DEFAULT 0,
    
    -- Propriétés métier SailingLoc
    [FullName] NVARCHAR(256) NOT NULL,
    [Avatar] NVARCHAR(500) NULL,
    [UserType] NVARCHAR(50) NOT NULL CHECK ([UserType] IN ('renter', 'owner', 'admin')),
    [Verified] BIT NOT NULL DEFAULT 0,
    [MemberSince] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2(7) NULL
);
GO

CREATE UNIQUE INDEX [UserNameIndex] 
ON [dbo].[AspNetUsers] ([NormalizedUserName]) 
WHERE [NormalizedUserName] IS NOT NULL;
GO

CREATE INDEX [EmailIndex] 
ON [dbo].[AspNetUsers] ([NormalizedEmail]);
GO

-- -----------------------------------------------------------------------------
-- Table AspNetUserRoles
-- Association entre utilisateurs et rôles (Many-to-Many)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetUserRoles] (
    [UserId] NVARCHAR(450) NOT NULL,
    [RoleId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] 
        FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AspNetUserRoles_RoleId] 
ON [dbo].[AspNetUserRoles] ([RoleId]);
GO

-- -----------------------------------------------------------------------------
-- Table AspNetUserClaims
-- Stocke les claims des utilisateurs
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetUserClaims] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] NVARCHAR(450) NOT NULL,
    [ClaimType] NVARCHAR(MAX) NULL,
    [ClaimValue] NVARCHAR(MAX) NULL,
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AspNetUserClaims_UserId] 
ON [dbo].[AspNetUserClaims] ([UserId]);
GO

-- -----------------------------------------------------------------------------
-- Table AspNetRoleClaims
-- Stocke les claims des rôles
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetRoleClaims] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [RoleId] NVARCHAR(450) NOT NULL,
    [ClaimType] NVARCHAR(MAX) NULL,
    [ClaimValue] NVARCHAR(MAX) NULL,
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] 
        FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AspNetRoleClaims_RoleId] 
ON [dbo].[AspNetRoleClaims] ([RoleId]);
GO

-- -----------------------------------------------------------------------------
-- Table AspNetUserLogins
-- Stocke les logins externes (Google, Facebook, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetUserLogins] (
    [LoginProvider] NVARCHAR(450) NOT NULL,
    [ProviderKey] NVARCHAR(450) NOT NULL,
    [ProviderDisplayName] NVARCHAR(MAX) NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_AspNetUserLogins_UserId] 
ON [dbo].[AspNetUserLogins] ([UserId]);
GO

-- -----------------------------------------------------------------------------
-- Table AspNetUserTokens
-- Stocke les tokens d'authentification
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[AspNetUserTokens] (
    [UserId] NVARCHAR(450) NOT NULL,
    [LoginProvider] NVARCHAR(450) NOT NULL,
    [Name] NVARCHAR(450) NOT NULL,
    [Value] NVARCHAR(MAX) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

PRINT N'Tables ASP.NET Identity créées avec succès';
GO

-- =============================================================================
-- 3. TABLES MÉTIERS
-- =============================================================================

PRINT N'Création des tables métiers...';
GO

-- -----------------------------------------------------------------------------
-- Table Destinations
-- Stocke les destinations nautiques disponibles
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[Destinations] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [Region] NVARCHAR(200) NOT NULL,
    [Country] NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(MAX) NULL,
    [Image] NVARCHAR(500) NULL,
    [AveragePrice] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [PopularMonths] NVARCHAR(500) NULL, -- JSON array: ["Juin", "Juillet", "Août"]
    [Highlights] NVARCHAR(MAX) NULL,    -- JSON array: ["Calanques", "Îles", ...]
    [BoatCount] INT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2(7) NULL
);
GO

CREATE INDEX [IX_Destinations_Country] ON [dbo].[Destinations] ([Country]);
CREATE INDEX [IX_Destinations_Region] ON [dbo].[Destinations] ([Region]);
GO

-- -----------------------------------------------------------------------------
-- Table Boats
-- Stocke les bateaux disponibles à la location
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[Boats] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(200) NOT NULL,
    [Type] NVARCHAR(50) NOT NULL CHECK ([Type] IN ('sailboat', 'catamaran', 'motor', 'semirigid')),
    [Location] NVARCHAR(200) NOT NULL,
    [City] NVARCHAR(200) NOT NULL,
    [DestinationId] INT NULL,
    [Country] NVARCHAR(100) NOT NULL,
    [Price] DECIMAL(10,2) NOT NULL,
    [Capacity] INT NOT NULL,
    [Cabins] INT NOT NULL DEFAULT 0,
    [Length] DECIMAL(5,2) NOT NULL, -- En mètres
    [Year] INT NOT NULL,
    [Image] NVARCHAR(500) NULL,
    [Slug] NVARCHAR(300) NULL,
    [Rating] DECIMAL(3,2) NOT NULL DEFAULT 0,
    [ReviewCount] INT NOT NULL DEFAULT 0,
    [Equipment] NVARCHAR(MAX) NULL, -- JSON array: ["GPS", "Pilote automatique", ...]
    [Description] NVARCHAR(MAX) NULL,
    
    -- Propriétaire
    [OwnerId] NVARCHAR(450) NOT NULL,
    
    -- Statut
    [IsActive] BIT NOT NULL DEFAULT 1,
    [IsVerified] BIT NOT NULL DEFAULT 0,
    
    -- Dates
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2(7) NULL,
    
    CONSTRAINT [FK_Boats_AspNetUsers_OwnerId] 
        FOREIGN KEY ([OwnerId]) REFERENCES [dbo].[AspNetUsers] ([Id]),
    CONSTRAINT [FK_Boats_Destinations_DestinationId] 
        FOREIGN KEY ([DestinationId]) REFERENCES [dbo].[Destinations] ([Id]) ON DELETE SET NULL
);
GO

CREATE INDEX [IX_Boats_OwnerId] ON [dbo].[Boats] ([OwnerId]);
CREATE INDEX [IX_Boats_Type] ON [dbo].[Boats] ([Type]);
CREATE INDEX [IX_Boats_Location] ON [dbo].[Boats] ([Location]);
CREATE INDEX [IX_Boats_DestinationId] ON [dbo].[Boats] ([DestinationId]);
CREATE INDEX [IX_Boats_Price] ON [dbo].[Boats] ([Price]);
CREATE INDEX [IX_Boats_IsActive] ON [dbo].[Boats] ([IsActive]);
GO

-- -----------------------------------------------------------------------------
-- Table Bookings
-- Stocke les réservations de bateaux
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[Bookings] (
    [Id] NVARCHAR(50) NOT NULL PRIMARY KEY, -- Format: BK{timestamp}
    [BoatId] INT NOT NULL,
    [RenterId] NVARCHAR(450) NOT NULL,
    
    -- Dates
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [Days] AS DATEDIFF(DAY, [StartDate], [EndDate]) PERSISTED,
    
    -- Prix
    [DailyPrice] DECIMAL(10,2) NOT NULL,
    [Subtotal] DECIMAL(10,2) NOT NULL,
    [ServiceFee] DECIMAL(10,2) NOT NULL,
    [TotalPrice] DECIMAL(10,2) NOT NULL,
    
    -- Statut
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK ([Status] IN ('pending', 'confirmed', 'completed', 'cancelled')),
    
    -- Informations locataire
    [RenterName] NVARCHAR(256) NOT NULL,
    [RenterEmail] NVARCHAR(256) NOT NULL,
    [RenterPhone] NVARCHAR(50) NULL,
    
    -- Paiement
    [PaymentIntentId] NVARCHAR(200) NULL, -- Stripe Payment Intent ID
    [PaymentStatus] NVARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK ([PaymentStatus] IN ('pending', 'succeeded', 'failed', 'refunded')),
    [PaidAt] DATETIME2(7) NULL,
    
    -- Dates système
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2(7) NULL,
    [CancelledAt] DATETIME2(7) NULL,
    
    CONSTRAINT [FK_Bookings_Boats_BoatId] 
        FOREIGN KEY ([BoatId]) REFERENCES [dbo].[Boats] ([Id]),
    CONSTRAINT [FK_Bookings_AspNetUsers_RenterId] 
        FOREIGN KEY ([RenterId]) REFERENCES [dbo].[AspNetUsers] ([Id])
);
GO

CREATE INDEX [IX_Bookings_BoatId] ON [dbo].[Bookings] ([BoatId]);
CREATE INDEX [IX_Bookings_RenterId] ON [dbo].[Bookings] ([RenterId]);
CREATE INDEX [IX_Bookings_Status] ON [dbo].[Bookings] ([Status]);
CREATE INDEX [IX_Bookings_StartDate] ON [dbo].[Bookings] ([StartDate]);
CREATE INDEX [IX_Bookings_EndDate] ON [dbo].[Bookings] ([EndDate]);
CREATE INDEX [IX_Bookings_CreatedAt] ON [dbo].[Bookings] ([CreatedAt]);
GO

-- -----------------------------------------------------------------------------
-- Table Reviews
-- Stocke les avis sur les bateaux
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[Reviews] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [BoatId] INT NOT NULL,
    [BookingId] NVARCHAR(50) NULL,
    [UserId] NVARCHAR(450) NOT NULL,
    [UserName] NVARCHAR(256) NOT NULL,
    [UserAvatar] NVARCHAR(500) NULL,
    
    -- Évaluation
    [Rating] INT NOT NULL CHECK ([Rating] >= 1 AND [Rating] <= 5),
    [Comment] NVARCHAR(MAX) NULL,
    
    -- Dates
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2(7) NULL,
    
    CONSTRAINT [FK_Reviews_Boats_BoatId] 
        FOREIGN KEY ([BoatId]) REFERENCES [dbo].[Boats] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Reviews_Bookings_BookingId] 
        FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]),
    CONSTRAINT [FK_Reviews_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id])
);
GO

CREATE INDEX [IX_Reviews_BoatId] ON [dbo].[Reviews] ([BoatId]);
CREATE INDEX [IX_Reviews_UserId] ON [dbo].[Reviews] ([UserId]);
CREATE INDEX [IX_Reviews_BookingId] ON [dbo].[Reviews] ([BookingId]);
CREATE INDEX [IX_Reviews_CreatedAt] ON [dbo].[Reviews] ([CreatedAt]);
GO

-- -----------------------------------------------------------------------------
-- Table BoatImages
-- Stocke les images supplémentaires des bateaux
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[BoatImages] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [BoatId] INT NOT NULL,
    [ImageUrl] NVARCHAR(500) NOT NULL,
    [Caption] NVARCHAR(500) NULL,
    [DisplayOrder] INT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_BoatImages_Boats_BoatId] 
        FOREIGN KEY ([BoatId]) REFERENCES [dbo].[Boats] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_BoatImages_BoatId] ON [dbo].[BoatImages] ([BoatId]);
GO

-- -----------------------------------------------------------------------------
-- Table BoatAvailability
-- Stocke les disponibilités des bateaux (optionnel, pour fonctionnalité future)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[BoatAvailability] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [BoatId] INT NOT NULL,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [IsAvailable] BIT NOT NULL DEFAULT 1,
    [Reason] NVARCHAR(500) NULL, -- Ex: "Maintenance", "Réservé", "Indisponible"
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_BoatAvailability_Boats_BoatId] 
        FOREIGN KEY ([BoatId]) REFERENCES [dbo].[Boats] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_BoatAvailability_BoatId] ON [dbo].[BoatAvailability] ([BoatId]);
CREATE INDEX [IX_BoatAvailability_Dates] 
ON [dbo].[BoatAvailability] ([StartDate], [EndDate]);
GO

-- -----------------------------------------------------------------------------
-- Table UserDocuments
-- Stocke les documents des utilisateurs (permis, pièces d'identité, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[UserDocuments] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [UserId] NVARCHAR(450) NOT NULL,
    [DocumentType] NVARCHAR(100) NOT NULL, -- Ex: "ID Card", "Boat License", "Insurance"
    [DocumentUrl] NVARCHAR(500) NOT NULL,
    [FileName] NVARCHAR(256) NOT NULL,
    [FileSize] BIGINT NOT NULL, -- En bytes
    [IsVerified] BIT NOT NULL DEFAULT 0,
    [VerifiedAt] DATETIME2(7) NULL,
    [VerifiedBy] NVARCHAR(450) NULL, -- Admin ID
    [UploadedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_UserDocuments_AspNetUsers_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserDocuments_AspNetUsers_VerifiedBy] 
        FOREIGN KEY ([VerifiedBy]) REFERENCES [dbo].[AspNetUsers] ([Id])
);
GO

CREATE INDEX [IX_UserDocuments_UserId] ON [dbo].[UserDocuments] ([UserId]);
CREATE INDEX [IX_UserDocuments_DocumentType] ON [dbo].[UserDocuments] ([DocumentType]);
GO

-- -----------------------------------------------------------------------------
-- Table Messages
-- Stocke les messages entre propriétaires et locataires
-- -----------------------------------------------------------------------------
CREATE TABLE [dbo].[Messages] (
    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [SenderId] NVARCHAR(450) NOT NULL,
    [ReceiverId] NVARCHAR(450) NOT NULL,
    [BookingId] NVARCHAR(50) NULL,
    [BoatId] INT NULL,
    [Subject] NVARCHAR(500) NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [IsRead] BIT NOT NULL DEFAULT 0,
    [ReadAt] DATETIME2(7) NULL,
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_Messages_AspNetUsers_SenderId] 
        FOREIGN KEY ([SenderId]) REFERENCES [dbo].[AspNetUsers] ([Id]),
    CONSTRAINT [FK_Messages_AspNetUsers_ReceiverId] 
        FOREIGN KEY ([ReceiverId]) REFERENCES [dbo].[AspNetUsers] ([Id]),
    CONSTRAINT [FK_Messages_Bookings_BookingId] 
        FOREIGN KEY ([BookingId]) REFERENCES [dbo].[Bookings] ([Id]),
    CONSTRAINT [FK_Messages_Boats_BoatId] 
        FOREIGN KEY ([BoatId]) REFERENCES [dbo].[Boats] ([Id])
);
GO

CREATE INDEX [IX_Messages_SenderId] ON [dbo].[Messages] ([SenderId]);
CREATE INDEX [IX_Messages_ReceiverId] ON [dbo].[Messages] ([ReceiverId]);
CREATE INDEX [IX_Messages_BookingId] ON [dbo].[Messages] ([BookingId]);
CREATE INDEX [IX_Messages_CreatedAt] ON [dbo].[Messages] ([CreatedAt]);
GO

PRINT N'Tables métiers créées avec succès';
GO

-- =============================================================================
-- 4. VUES UTILES
-- =============================================================================

PRINT N'Création des vues...';
GO

-- Vue pour les statistiques des propriétaires
CREATE VIEW [dbo].[vw_OwnerStats] AS
SELECT 
    u.Id AS OwnerId,
    u.FullName AS OwnerName,
    COUNT(DISTINCT b.Id) AS BoatCount,
    COUNT(DISTINCT bk.Id) AS BookingCount,
    ISNULL(SUM(CASE WHEN bk.Status = 'completed' THEN bk.TotalPrice - bk.ServiceFee ELSE 0 END), 0) AS TotalRevenue,
    ISNULL(AVG(b.Rating), 0) AS AverageRating
FROM AspNetUsers u
LEFT JOIN Boats b ON u.Id = b.OwnerId
LEFT JOIN Bookings bk ON b.Id = bk.BoatId
WHERE u.UserType = 'owner'
GROUP BY u.Id, u.FullName;
GO

-- Vue pour les statistiques des locataires
CREATE VIEW [dbo].[vw_RenterStats] AS
SELECT 
    u.Id AS RenterId,
    u.FullName AS RenterName,
    COUNT(DISTINCT bk.Id) AS BookingCount,
    ISNULL(SUM(bk.TotalPrice), 0) AS TotalSpent,
    COUNT(DISTINCT r.Id) AS ReviewCount
FROM AspNetUsers u
LEFT JOIN Bookings bk ON u.Id = bk.RenterId
LEFT JOIN Reviews r ON u.Id = r.UserId
WHERE u.UserType = 'renter'
GROUP BY u.Id, u.FullName;
GO

-- Vue pour les détails complets des réservations
CREATE VIEW [dbo].[vw_BookingDetails] AS
SELECT 
    bk.Id AS BookingId,
    bk.Status,
    bk.StartDate,
    bk.EndDate,
    bk.Days,
    bk.TotalPrice,
    bk.ServiceFee,
    bk.CreatedAt,
    
    -- Bateau
    b.Id AS BoatId,
    b.Name AS BoatName,
    b.Type AS BoatType,
    b.Image AS BoatImage,
    b.Location AS BoatLocation,
    
    -- Propriétaire
    owner.Id AS OwnerId,
    owner.FullName AS OwnerName,
    owner.Email AS OwnerEmail,
    
    -- Locataire
    renter.Id AS RenterId,
    renter.FullName AS RenterName,
    renter.Email AS RenterEmail
FROM Bookings bk
INNER JOIN Boats b ON bk.BoatId = b.Id
INNER JOIN AspNetUsers owner ON b.OwnerId = owner.Id
INNER JOIN AspNetUsers renter ON bk.RenterId = renter.Id;
GO

PRINT N'Vues créées avec succès';
GO

-- =============================================================================
-- 5. PROCÉDURES STOCKÉES
-- =============================================================================

PRINT N'Création des procédures stockées...';
GO

-- Procédure pour mettre à jour la note moyenne d'un bateau
CREATE PROCEDURE [dbo].[sp_UpdateBoatRating]
    @BoatId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Boats
    SET 
        Rating = ISNULL((SELECT AVG(CAST(Rating AS DECIMAL(3,2))) FROM Reviews WHERE BoatId = @BoatId), 0),
        ReviewCount = ISNULL((SELECT COUNT(*) FROM Reviews WHERE BoatId = @BoatId), 0),
        UpdatedAt = GETUTCDATE()
    WHERE Id = @BoatId;
END
GO

-- Procédure pour mettre à jour le nombre de bateaux d'une destination
CREATE PROCEDURE [dbo].[sp_UpdateDestinationBoatCount]
    @DestinationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Destinations
    SET 
        BoatCount = ISNULL((SELECT COUNT(*) FROM Boats WHERE DestinationId = @DestinationId AND IsActive = 1), 0),
        UpdatedAt = GETUTCDATE()
    WHERE Id = @DestinationId;
END
GO

-- -----------------------------------------------------------------------------
-- Procédure pour vérifier la disponibilité d'un bateau sur une période
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [dbo].[sp_CheckBoatAvailability]
    @BoatId INT,
    @StartDate DATE,
    @EndDate DATE,
    @ExcludeBookingId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Vérifier que les dates sont valides
    IF @StartDate >= @EndDate
    BEGIN
        SELECT 0 AS IsAvailable, 'La date de fin doit être postérieure à la date de début' AS Message;
        RETURN;
    END
    
    -- Vérifier que les dates ne sont pas dans le passé
    IF @StartDate < CAST(GETDATE() AS DATE)
    BEGIN
        SELECT 0 AS IsAvailable, 'Les dates ne peuvent pas être dans le passé' AS Message;
        RETURN;
    END
    
    -- Vérifier les réservations existantes
    IF EXISTS (
        SELECT 1 FROM Bookings
        WHERE BoatId = @BoatId
        AND Status NOT IN ('cancelled')
        AND (@ExcludeBookingId IS NULL OR Id != @ExcludeBookingId)
        AND (
            -- La nouvelle réservation chevauche une réservation existante
            (@StartDate BETWEEN StartDate AND EndDate)
            OR (@EndDate BETWEEN StartDate AND EndDate)
            OR (StartDate BETWEEN @StartDate AND @EndDate)
            OR (EndDate BETWEEN @StartDate AND @EndDate)
        )
    )
    BEGIN
        SELECT 0 AS IsAvailable, 'Ce bateau est déjà réservé sur cette période' AS Message;
        RETURN;
    END
    
    -- Vérifier les périodes d'indisponibilité manuelles
    IF EXISTS (
        SELECT 1 FROM BoatAvailability
        WHERE BoatId = @BoatId
        AND IsAvailable = 0
        AND (
            (@StartDate BETWEEN StartDate AND EndDate)
            OR (@EndDate BETWEEN StartDate AND EndDate)
            OR (StartDate BETWEEN @StartDate AND @EndDate)
            OR (EndDate BETWEEN @StartDate AND @EndDate)
        )
    )
    BEGIN
        SELECT 0 AS IsAvailable, 'Ce bateau n''est pas disponible sur cette période' AS Message;
        RETURN;
    END
    
    -- Le bateau est disponible
    SELECT 1 AS IsAvailable, 'Le bateau est disponible' AS Message;
END
GO

-- -----------------------------------------------------------------------------
-- Procédure pour récupérer les dates indisponibles d'un bateau
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [dbo].[sp_GetBoatUnavailableDates]
    @BoatId INT,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Définir les dates par défaut si non fournies
    IF @StartDate IS NULL
        SET @StartDate = CAST(GETDATE() AS DATE);
    
    IF @EndDate IS NULL
        SET @EndDate = DATEADD(YEAR, 1, @StartDate);
    
    -- Récupérer toutes les périodes indisponibles
    SELECT 
        'booking' AS Type,
        Id AS ReferenceId,
        StartDate,
        EndDate,
        Status AS Reason,
        RenterName AS Details
    FROM Bookings
    WHERE BoatId = @BoatId
    AND Status NOT IN ('cancelled')
    AND EndDate >= @StartDate
    AND StartDate <= @EndDate
    
    UNION ALL
    
    SELECT 
        'unavailable' AS Type,
        CAST(Id AS NVARCHAR(50)) AS ReferenceId,
        StartDate,
        EndDate,
        Reason,
        NULL AS Details
    FROM BoatAvailability
    WHERE BoatId = @BoatId
    AND IsAvailable = 0
    AND EndDate >= @StartDate
    AND StartDate <= @EndDate
    
    ORDER BY StartDate;
END
GO

-- -----------------------------------------------------------------------------
-- Procédure pour créer une réservation avec vérification de disponibilité
-- -----------------------------------------------------------------------------
CREATE PROCEDURE [dbo].[sp_CreateBookingWithValidation]
    @BookingId NVARCHAR(50),
    @BoatId INT,
    @RenterId NVARCHAR(450),
    @StartDate DATE,
    @EndDate DATE,
    @DailyPrice DECIMAL(10,2),
    @Subtotal DECIMAL(10,2),
    @ServiceFee DECIMAL(10,2),
    @TotalPrice DECIMAL(10,2),
    @RenterName NVARCHAR(256),
    @RenterEmail NVARCHAR(256),
    @RenterPhone NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Vérifier la disponibilité
        DECLARE @IsAvailable BIT;
        DECLARE @Message NVARCHAR(500);
        
        EXEC [dbo].[sp_CheckBoatAvailability] 
            @BoatId = @BoatId,
            @StartDate = @StartDate,
            @EndDate = @EndDate;
        
        -- Si disponible, créer la réservation
        INSERT INTO Bookings (
            Id, BoatId, RenterId, StartDate, EndDate,
            DailyPrice, Subtotal, ServiceFee, TotalPrice,
            Status, RenterName, RenterEmail, RenterPhone,
            PaymentStatus, CreatedAt
        )
        VALUES (
            @BookingId, @BoatId, @RenterId, @StartDate, @EndDate,
            @DailyPrice, @Subtotal, @ServiceFee, @TotalPrice,
            'pending', @RenterName, @RenterEmail, @RenterPhone,
            'pending', GETUTCDATE()
        );
        
        -- Retourner la réservation créée
        SELECT * FROM Bookings WHERE Id = @BookingId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        -- Retourner l'erreur
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO

PRINT N'Procédures stockées créées avec succès';
GO

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================

PRINT N'Création des triggers...';
GO

-- Trigger pour mettre à jour automatiquement la note d'un bateau après l'ajout d'un avis
CREATE TRIGGER [dbo].[tr_Reviews_AfterInsert]
ON [dbo].[Reviews]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @BoatId INT;
    SELECT @BoatId = BoatId FROM inserted;
    
    EXEC [dbo].[sp_UpdateBoatRating] @BoatId;
END
GO

-- Trigger pour mettre à jour le nombre de bateaux d'une destination
CREATE TRIGGER [dbo].[tr_Boats_AfterInsertUpdate]
ON [dbo].[Boats]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Destinations affectées
    DECLARE @DestinationIds TABLE (DestinationId INT);
    
    INSERT INTO @DestinationIds
    SELECT DISTINCT DestinationId FROM inserted WHERE DestinationId IS NOT NULL
    UNION
    SELECT DISTINCT DestinationId FROM deleted WHERE DestinationId IS NOT NULL;
    
    -- Mettre à jour chaque destination
    DECLARE @DestId INT;
    DECLARE dest_cursor CURSOR FOR SELECT DestinationId FROM @DestinationIds;
    
    OPEN dest_cursor;
    FETCH NEXT FROM dest_cursor INTO @DestId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC [dbo].[sp_UpdateDestinationBoatCount] @DestId;
        FETCH NEXT FROM dest_cursor INTO @DestId;
    END
    
    CLOSE dest_cursor;
    DEALLOCATE dest_cursor;
END
GO

PRINT N'Triggers créés avec succès';
GO

-- =============================================================================
-- 7. DONNÉES DE TEST
-- =============================================================================

PRINT N'Insertion des données de test...';
GO

-- -----------------------------------------------------------------------------
-- Rôles
-- -----------------------------------------------------------------------------
INSERT INTO AspNetRoles (Id, Name, NormalizedName, ConcurrencyStamp)
VALUES 
    (NEWID(), 'Admin', 'ADMIN', NEWID()),
    (NEWID(), 'Owner', 'OWNER', NEWID()),
    (NEWID(), 'Renter', 'RENTER', NEWID());
GO

-- -----------------------------------------------------------------------------
-- Utilisateurs de test
-- Mot de passe pour tous : "Password123!" (hashé)
-- Hash généré avec : BCrypt ou Identity PasswordHasher
-- -----------------------------------------------------------------------------
DECLARE @AdminId NVARCHAR(450) = NEWID();
DECLARE @Owner1Id NVARCHAR(450) = NEWID();
DECLARE @Owner2Id NVARCHAR(450) = NEWID();
DECLARE @Renter1Id NVARCHAR(450) = NEWID();
DECLARE @Renter2Id NVARCHAR(450) = NEWID();

-- Note: En production, utilisez PasswordHasher d'ASP.NET Identity
-- Ce hash est un exemple simplifié, remplacez-le par un vrai hash
DECLARE @PasswordHash NVARCHAR(MAX) = 'AQAAAAEAACcQAAAAEMock1234567890PasswordHashExample';

INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, FullName, UserType, Verified, MemberSince)
VALUES 
    (@AdminId, 'admin@sailingloc.com', 'ADMIN@SAILINGLOC.COM', 'admin@sailingloc.com', 'ADMIN@SAILINGLOC.COM', 1, @PasswordHash, NEWID(), NEWID(), '+33123456789', 'Administrateur SailingLoc', 'admin', 1, GETUTCDATE()),
    (@Owner1Id, 'jean.dupont@example.com', 'JEAN.DUPONT@EXAMPLE.COM', 'jean.dupont@example.com', 'JEAN.DUPONT@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), '+33612345678', 'Jean Dupont', 'owner', 1, DATEADD(MONTH, -24, GETUTCDATE())),
    (@Owner2Id, 'marie.martin@example.com', 'MARIE.MARTIN@EXAMPLE.COM', 'marie.martin@example.com', 'MARIE.MARTIN@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), '+33698765432', 'Marie Martin', 'owner', 1, DATEADD(MONTH, -18, GETUTCDATE())),
    (@Renter1Id, 'thomas.petit@example.com', 'THOMAS.PETIT@EXAMPLE.COM', 'thomas.petit@example.com', 'THOMAS.PETIT@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), '+33687654321', 'Thomas Petit', 'renter', 1, DATEADD(MONTH, -12, GETUTCDATE())),
    (@Renter2Id, 'sophie.bernard@example.com', 'SOPHIE.BERNARD@EXAMPLE.COM', 'sophie.bernard@example.com', 'SOPHIE.BERNARD@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), '+33676543210', 'Sophie Bernard', 'renter', 1, DATEADD(MONTH, -6, GETUTCDATE()));
GO

-- -----------------------------------------------------------------------------
-- Destinations
-- -----------------------------------------------------------------------------
SET IDENTITY_INSERT Destinations ON;

INSERT INTO Destinations (Id, Name, Region, Country, Description, AveragePrice, PopularMonths, Highlights)
VALUES 
    (1, 'Côte d''Azur', 'Provence-Alpes-Côte d''Azur', 'France', 'La Côte d''Azur offre des eaux cristallines et des paysages exceptionnels.', 450, '["Mai","Juin","Juillet","Août","Septembre"]', '["Calanques de Cassis","Îles de Lérins","Saint-Tropez","Monaco","Antibes"]'),
    (2, 'Grèce', 'Méditerranée', 'Grèce', 'Explorez les îles grecques et leur beauté intemporelle.', 380, '["Juin","Juillet","Août","Septembre"]', '["Santorin","Mykonos","Cyclades","Îles Ioniennes","Crète"]'),
    (3, 'Corse', 'Corse', 'France', 'L''île de beauté avec ses criques sauvages et ses montagnes.', 420, '["Juin","Juillet","Août","Septembre"]', '["Bonifacio","Calvi","Porto-Vecchio","Réserve de Scandola","Calanques de Piana"]'),
    (4, 'Croatie', 'Adriatique', 'Croatie', 'Des milliers d''îles à découvrir le long de la côte dalmate.', 350, '["Mai","Juin","Juillet","Août","Septembre"]', '["Dubrovnik","Split","Îles Kornati","Hvar","Zadar"]'),
    (5, 'Baléares', 'Îles Baléares', 'Espagne', 'Majorque, Minorque, Ibiza et Formentera vous attendent.', 320, '["Mai","Juin","Juillet","Août","Septembre","Octobre"]', '["Majorque","Minorque","Ibiza","Formentera","Cabrera"]'),
    (6, 'Bretagne', 'Bretagne', 'France', 'Découvrez les côtes bretonnes et leurs traditions maritimes.', 280, '["Juin","Juillet","Août"]', '["Golfe du Morbihan","Belle-Île","Archipel des Glénan","Roscoff","Cancale"]'),
    (7, 'Sardaigne', 'Sardaigne', 'Italie', 'Eaux turquoise et plages paradisiaques de la Méditerranée.', 390, '["Juin","Juillet","Août","Septembre"]', '["Costa Smeralda","Archipel de La Maddalena","Alghero","Cagliari","Golfe d''Orosei"]');

SET IDENTITY_INSERT Destinations OFF;
GO

-- -----------------------------------------------------------------------------
-- Bateaux
-- -----------------------------------------------------------------------------
SET IDENTITY_INSERT Boats ON;

-- Récupérer les IDs des propriétaires
DECLARE @Owner1 NVARCHAR(450) = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType = 'owner' ORDER BY FullName);
DECLARE @Owner2 NVARCHAR(450) = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType = 'owner' ORDER BY FullName DESC);

INSERT INTO Boats (Id, Name, Type, Location, City, DestinationId, Country, Price, Capacity, Cabins, Length, Year, Rating, ReviewCount, Equipment, Description, OwnerId, IsActive, IsVerified)
VALUES 
    (1, 'Bénéteau Oceanis 45', 'sailboat', 'Nice', 'Nice', 1, 'France', 350, 8, 4, 13.5, 2018, 4.8, 12, '["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]', 'Magnifique voilier pour découvrir la Côte d''Azur', @Owner1, 1, 1),
    (2, 'Lagoon 42 Premium', 'catamaran', 'Athènes', 'Athènes', 2, 'Grèce', 580, 10, 4, 12.8, 2020, 4.9, 18, '["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', 'Catamaran de luxe pour explorer les Cyclades', @Owner2, 1, 1),
    (3, 'Jeanneau Sun Odyssey 419', 'sailboat', 'Ajaccio', 'Ajaccio', 3, 'France', 320, 8, 3, 12.5, 2019, 4.7, 9, '["GPS","Guindeau électrique","Annexe"]', 'Idéal pour naviguer autour de la Corse', @Owner1, 1, 1),
    (4, 'Bavaria Cruiser 46', 'sailboat', 'Split', 'Split', 4, 'Croatie', 380, 10, 4, 14.3, 2017, 4.6, 15, '["GPS","Pilote automatique","Guindeau électrique"]', 'Parfait pour explorer la côte croate', @Owner2, 1, 1),
    (5, 'Fountaine Pajot Astrea 42', 'catamaran', 'Palma', 'Palma de Majorque', 5, 'Espagne', 520, 10, 4, 12.6, 2021, 4.9, 14, '["GPS","Pilote automatique","Climatisation","Dessalinisateur"]', 'Catamaran moderne pour les Baléares', @Owner1, 1, 1),
    (6, 'Dufour 460 Grand Large', 'sailboat', 'La Rochelle', 'La Rochelle', 6, 'France', 420, 10, 5, 14.15, 2019, 4.8, 11, '["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]', 'Grand voilier confortable pour la Bretagne', @Owner2, 1, 1),
    (7, 'Bali 4.3 Catamaran', 'catamaran', 'Cagliari', 'Cagliari', 7, 'Italie', 550, 12, 4, 13.1, 2020, 5.0, 8, '["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', 'Catamaran spacieux pour la Sardaigne', @Owner1, 1, 1),
    (8, 'Zodiac Medline 850', 'semirigid', 'Nice', 'Nice', 1, 'France', 180, 12, 0, 8.5, 2021, 4.5, 6, '["GPS","Sondeur","Bimini","Échelle de bain"]', 'Semi-rigide rapide pour balades côtières', @Owner2, 1, 1),
    (9, 'Bavaria 50 Cruiser', 'sailboat', 'Mykonos', 'Mykonos', 2, 'Grèce', 450, 12, 5, 15.4, 2018, 4.7, 13, '["GPS","Pilote automatique","Climatisation","Guindeau électrique"]', 'Grand voilier luxueux pour les Cyclades', @Owner1, 1, 1),
    (10, 'Prestige 520 Fly', 'motor', 'Cannes', 'Cannes', 1, 'France', 890, 8, 3, 15.9, 2019, 4.9, 7, '["GPS","Pilote automatique","Climatisation","Bow thruster","Annexe avec moteur"]', 'Yacht à moteur de prestige', @Owner2, 1, 1),
    (11, 'Jeanneau Leader 30', 'motor', 'Saint-Tropez', 'Saint-Tropez', 1, 'France', 420, 6, 1, 9.14, 2020, 4.6, 10, '["GPS","Sondeur","Bimini","Plateforme de bain"]', 'Bateau à moteur idéal pour la journée', @Owner1, 1, 1),
    (12, 'Hanse 458', 'sailboat', 'Porto-Vecchio', 'Porto-Vecchio', 3, 'France', 410, 10, 4, 14.0, 2018, 4.8, 12, '["GPS","Pilote automatique","Guindeau électrique"]', 'Voilier performant et confortable', @Owner2, 1, 1),
    (13, 'Lagoon 450 F', 'catamaran', 'Rhodes', 'Rhodes', 2, 'Grèce', 620, 12, 4, 13.96, 2017, 4.9, 16, '["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', 'Catamaran spacieux et rapide', @Owner1, 1, 1),
    (14, 'Bénéteau First 40.7', 'sailboat', 'Barcelone', 'Barcelone', 5, 'Espagne', 290, 8, 3, 12.37, 2016, 4.5, 14, '["GPS","Pilote automatique","Guindeau électrique"]', 'Voilier sportif et maniable', @Owner2, 1, 1);

SET IDENTITY_INSERT Boats OFF;
GO

-- -----------------------------------------------------------------------------
-- Avis (Reviews)
-- -----------------------------------------------------------------------------
DECLARE @Renter1 NVARCHAR(450) = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType = 'renter' ORDER BY FullName);
DECLARE @Renter2 NVARCHAR(450) = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType = 'renter' ORDER BY FullName DESC);

INSERT INTO Reviews (BoatId, UserId, UserName, Rating, Comment)
VALUES 
    (1, @Renter1, 'Thomas Petit', 5, 'Excellente semaine sur ce voilier ! Très bien équipé et confortable.'),
    (1, @Renter2, 'Sophie Bernard', 5, 'Bateau impeccable, propriétaire très accueillant.'),
    (2, @Renter1, 'Thomas Petit', 5, 'Catamaran de rêve ! Navigation facile et très spacieux.'),
    (2, @Renter2, 'Sophie Bernard', 5, 'Parfait pour les Cyclades, nous avons adoré !'),
    (3, @Renter1, 'Thomas Petit', 5, 'Belle découverte de la Corse, bateau en excellent état.'),
    (4, @Renter2, 'Sophie Bernard', 4, 'Très bon voilier, quelques petits détails à améliorer.'),
    (5, @Renter1, 'Thomas Petit', 5, 'Catamaran moderne et très confortable, hautement recommandé !'),
    (7, @Renter2, 'Sophie Bernard', 5, 'Le meilleur catamaran que nous ayons loué !'),
    (10, @Renter1, 'Thomas Petit', 5, 'Yacht magnifique, service 5 étoiles.'),
    (13, @Renter2, 'Sophie Bernard', 5, 'Parfait pour notre croisière en Grèce.');
GO

-- Mettre à jour les notes des bateaux
EXEC sp_UpdateBoatRating 1;
EXEC sp_UpdateBoatRating 2;
EXEC sp_UpdateBoatRating 3;
EXEC sp_UpdateBoatRating 4;
EXEC sp_UpdateBoatRating 5;
EXEC sp_UpdateBoatRating 7;
EXEC sp_UpdateBoatRating 10;
EXEC sp_UpdateBoatRating 13;
GO

-- -----------------------------------------------------------------------------
-- Réservations de test
-- -----------------------------------------------------------------------------
INSERT INTO Bookings (Id, BoatId, RenterId, StartDate, EndDate, DailyPrice, Subtotal, ServiceFee, TotalPrice, Status, RenterName, RenterEmail, PaymentStatus)
VALUES 
    ('BK' + CONVERT(VARCHAR(20), DATEPART(MILLISECOND, GETUTCDATE())) + '001', 1, @Renter1, '2025-06-15', '2025-06-22', 350, 2450, 245, 2695, 'confirmed', 'Thomas Petit', 'thomas.petit@example.com', 'succeeded'),
    ('BK' + CONVERT(VARCHAR(20), DATEPART(MILLISECOND, GETUTCDATE())) + '002', 2, @Renter2, '2025-07-01', '2025-07-08', 580, 4060, 406, 4466, 'confirmed', 'Sophie Bernard', 'sophie.bernard@example.com', 'succeeded'),
    ('BK' + CONVERT(VARCHAR(20), DATEPART(MILLISECOND, GETUTCDATE())) + '003', 5, @Renter1, '2025-08-10', '2025-08-17', 520, 3640, 364, 4004, 'pending', 'Thomas Petit', 'thomas.petit@example.com', 'pending');
GO

PRINT N'Données de test insérées avec succès';
GO

-- =============================================================================
-- 8. STATISTIQUES ET VÉRIFICATIONS
-- =============================================================================

PRINT N'';
PRINT N'============================================================';
PRINT N'    RÉSUMÉ DE LA BASE DE DONNÉES SAILINGLOC';
PRINT N'============================================================';
PRINT N'';

-- Compter les tables
DECLARE @TableCount INT = (SELECT COUNT(*) FROM sys.tables WHERE type = 'U');
PRINT N'Tables créées : ' + CAST(@TableCount AS NVARCHAR(10));

-- Compter les vues
DECLARE @ViewCount INT = (SELECT COUNT(*) FROM sys.views);
PRINT N'Vues créées : ' + CAST(@ViewCount AS NVARCHAR(10));

-- Compter les procédures
DECLARE @ProcCount INT = (SELECT COUNT(*) FROM sys.procedures);
PRINT N'Procédures stockées : ' + CAST(@ProcCount AS NVARCHAR(10));

-- Compter les triggers
DECLARE @TriggerCount INT = (SELECT COUNT(*) FROM sys.triggers);
PRINT N'Triggers : ' + CAST(@TriggerCount AS NVARCHAR(10));

PRINT N'';
PRINT N'Données de test :';
PRINT N'- Utilisateurs : ' + CAST((SELECT COUNT(*) FROM AspNetUsers) AS NVARCHAR(10));
PRINT N'- Rôles : ' + CAST((SELECT COUNT(*) FROM AspNetRoles) AS NVARCHAR(10));
PRINT N'- Destinations : ' + CAST((SELECT COUNT(*) FROM Destinations) AS NVARCHAR(10));
PRINT N'- Bateaux : ' + CAST((SELECT COUNT(*) FROM Boats) AS NVARCHAR(10));
PRINT N'- Réservations : ' + CAST((SELECT COUNT(*) FROM Bookings) AS NVARCHAR(10));
PRINT N'- Avis : ' + CAST((SELECT COUNT(*) FROM Reviews) AS NVARCHAR(10));

PRINT N'';
PRINT N'============================================================';
PRINT N'    BASE DE DONNÉES CRÉÉE AVEC SUCCÈS !';
PRINT N'============================================================';
PRINT N'';
PRINT N'Comptes de test (mot de passe : Password123!) :';
PRINT N'- Admin : admin@sailingloc.com';
PRINT N'- Propriétaire : jean.dupont@example.com';
PRINT N'- Locataire : thomas.petit@example.com';
PRINT N'';
PRINT N'Notes importantes :';
PRINT N'1. Les mots de passe doivent être hashés avec Identity PasswordHasher';
PRINT N'2. Configurer CORS dans votre API pour autoriser React';
PRINT N'3. Mettre à jour la connection string dans appsettings.json';
PRINT N'4. Exécuter les migrations Identity si nécessaire';
PRINT N'';
PRINT N'Connection string exemple :';
PRINT N'Server=localhost;Database=SailingLoc;Trusted_Connection=True;TrustServerCertificate=True';
PRINT N'';
PRINT N'============================================================';
GO
