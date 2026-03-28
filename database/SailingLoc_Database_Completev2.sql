USE [SailingLoc]
GO
/****** Object:  UserDefinedDataType [dbo].[UserStatus]    Script Date: 07/12/2025 13:45:15 ******/
CREATE TYPE [dbo].[UserStatus] FROM [int] NOT NULL
GO
/****** Object:  UserDefinedTableType [dbo].[AddressType]    Script Date: 07/12/2025 13:45:15 ******/
CREATE TYPE [dbo].[AddressType] AS TABLE(
	[Street] [nvarchar](256) NOT NULL,
	[City] [nvarchar](128) NOT NULL,
	[State] [nvarchar](128) NOT NULL,
	[PostalCode] [nvarchar](32) NOT NULL,
	[Country] [nvarchar](128) NOT NULL
)
GO
/****** Object:  UserDefinedFunction [dbo].[GetUserFullName]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetUserFullName](@UserId UNIQUEIDENTIFIER)
RETURNS NVARCHAR(205)
AS
BEGIN
    DECLARE @full NVARCHAR(205);
    SELECT @full =
        LTRIM(RTRIM(
            COALESCE(NULLIF(FirstName, N''), N'') + N' ' +
            COALESCE(NULLIF(LastName,  N''), N'')
        ))
    FROM dbo.AspNetUsers
    WHERE Id = @UserId;

    RETURN @full;
END
GO
/****** Object:  Table [dbo].[AspNetUsers]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUsers](
	[Id] [uniqueidentifier] NOT NULL,
	[UserName] [nvarchar](256) NULL,
	[NormalizedUserName] [nvarchar](256) NULL,
	[Email] [nvarchar](256) NULL,
	[NormalizedEmail] [nvarchar](256) NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[PasswordHash] [nvarchar](max) NULL,
	[SecurityStamp] [nvarchar](max) NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
	[PhoneNumber] [nvarchar](max) NULL,
	[PhoneNumberConfirmed] [bit] NOT NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[LockoutEnd] [datetimeoffset](7) NULL,
	[LockoutEnabled] [bit] NOT NULL,
	[AccessFailedCount] [int] NOT NULL,
	[FirstName] [nvarchar](100) NOT NULL,
	[LastName] [nvarchar](100) NOT NULL,
	[BirthDate] [datetime2](7) NOT NULL,
	[Address_Street] [nvarchar](256) NOT NULL,
	[Address_City] [nvarchar](128) NOT NULL,
	[Address_State] [nvarchar](128) NOT NULL,
	[Address_PostalCode] [nvarchar](32) NOT NULL,
	[Address_Country] [nvarchar](128) NOT NULL,
	[Status] [int] NOT NULL,
	[UserType] [nvarchar](50) NOT NULL,
	[Verified] [bit] NOT NULL,
	[MemberSince] [datetime2](7) NOT NULL,
	[AvatarUrl] [nvarchar](512) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[LastLoginAt] [datetime2](7) NULL,
 CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Boats]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Boats](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](200) NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
	[Location] [nvarchar](200) NOT NULL,
	[City] [nvarchar](200) NOT NULL,
	[DestinationId] [int] NULL,
	[Country] [nvarchar](100) NOT NULL,
	[Price] [decimal](10, 2) NOT NULL,
	[Capacity] [int] NOT NULL,
	[Cabins] [int] NOT NULL,
	[Length] [decimal](5, 2) NOT NULL,
	[Year] [int] NOT NULL,
	[Image] [nvarchar](500) NULL,
	[Rating] [decimal](3, 2) NOT NULL,
	[ReviewCount] [int] NOT NULL,
	[Equipment] [nvarchar](max) NULL,
	[Description] [nvarchar](max) NULL,
	[OwnerId] [uniqueidentifier] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsVerified] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[IsDeleted] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Bookings]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bookings](
	[Id] [nvarchar](50) NOT NULL,
	[BoatId] [int] NOT NULL,
	[RenterId] [uniqueidentifier] NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[Days]  AS (datediff(day,[StartDate],[EndDate])) PERSISTED,
	[DailyPrice] [decimal](10, 2) NOT NULL,
	[Subtotal] [decimal](10, 2) NOT NULL,
	[ServiceFee] [decimal](10, 2) NOT NULL,
	[TotalPrice] [decimal](10, 2) NOT NULL,
	[Status] [nvarchar](50) NOT NULL,
	[RenterName] [nvarchar](256) NOT NULL,
	[RenterEmail] [nvarchar](256) NOT NULL,
	[RenterPhone] [nvarchar](50) NULL,
	[PaymentIntentId] [nvarchar](200) NULL,
	[PaymentStatus] [nvarchar](50) NOT NULL,
	[PaidAt] [datetime2](7) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[CancelledAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_BookingDetails]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
    LTRIM(RTRIM(ISNULL(owner.FirstName, '') + ' ' + ISNULL(owner.LastName, ''))) AS OwnerName ,
    owner.Email AS OwnerEmail,
    
    -- Locataire
    renter.Id AS RenterId,
    LTRIM(RTRIM(ISNULL(renter.FirstName, '') + ' ' + ISNULL(renter.LastName, ''))) AS RenterName ,
    renter.Email AS RenterEmail
FROM Bookings bk
INNER JOIN Boats b ON bk.BoatId = b.Id
INNER JOIN AspNetUsers owner ON b.OwnerId = owner.Id
INNER JOIN AspNetUsers renter ON bk.RenterId = renter.Id;
GO
/****** Object:  View [dbo].[vw_OwnerStats]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_OwnerStats]
AS
SELECT 
    u.Id AS OwnerId,
    LTRIM(RTRIM(ISNULL(u.FirstName, '') + ' ' + ISNULL(u.LastName, ''))) AS OwnerName,
    COUNT(DISTINCT b.Id) AS BoatCount,
    COUNT(DISTINCT bk.Id) AS BookingCount,
    ISNULL(SUM(CASE 
        WHEN bk.Status = 'completed' 
        THEN bk.TotalPrice - bk.ServiceFee 
        ELSE 0 
    END), 0) AS TotalRevenue,
    ISNULL(AVG(b.Rating), 0) AS AverageRating
FROM dbo.AspNetUsers u
LEFT JOIN dbo.Boats b ON u.Id = b.OwnerId
LEFT JOIN dbo.Bookings bk ON b.Id = bk.BoatId
WHERE u.UserType = 'owner'
GROUP BY 
    u.Id,
    LTRIM(RTRIM(ISNULL(u.FirstName, '') + ' ' + ISNULL(u.LastName, '')));
GO
/****** Object:  Table [dbo].[Reviews]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reviews](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[BoatId] [int] NOT NULL,
	[BookingId] [nvarchar](50) NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[UserName] [nvarchar](256) NOT NULL,
	[UserAvatar] [nvarchar](500) NULL,
	[Rating] [int] NOT NULL,
	[Comment] [nvarchar](max) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_RenterStats]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_RenterStats]
AS
SELECT 
    u.Id AS RenterId,
    LTRIM(RTRIM(ISNULL(u.FirstName, '') + ' ' + ISNULL(u.LastName, ''))) AS RenterName,
    COUNT(DISTINCT bk.Id) AS BookingCount,
    ISNULL(SUM(bk.TotalPrice), 0) AS TotalSpent,
    COUNT(DISTINCT r.Id) AS ReviewCount
FROM dbo.AspNetUsers u
LEFT JOIN dbo.Bookings bk ON u.Id = bk.RenterId
LEFT JOIN dbo.Reviews r ON u.Id = r.UserId
WHERE u.UserType = 'renter'
GROUP BY 
    u.Id,
    LTRIM(RTRIM(ISNULL(u.FirstName, '') + ' ' + ISNULL(u.LastName, '')));
GO
/****** Object:  UserDefinedFunction [dbo].[fn_GetUsersByStatus]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[fn_GetUsersByStatus](@Status dbo.UserStatus)
RETURNS TABLE
AS
RETURN
(
    SELECT
        u.Id,
        u.Email,
        u.FirstName,
        u.LastName,
        u.Status,
        u.CreatedAt,
        u.UpdatedAt
    FROM dbo.AspNetUsers AS u WITH (NOLOCK)
    WHERE u.Status = @Status
);
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoleClaims]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoleClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoleId] [uniqueidentifier] NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoles]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoles](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](256) NULL,
	[NormalizedName] [nvarchar](256) NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserClaims]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserLogins]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserLogins](
	[LoginProvider] [nvarchar](450) NOT NULL,
	[ProviderKey] [nvarchar](450) NOT NULL,
	[ProviderDisplayName] [nvarchar](256) NULL,
	[UserId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY CLUSTERED 
(
	[LoginProvider] ASC,
	[ProviderKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserRoles]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserRoles](
	[UserId] [uniqueidentifier] NOT NULL,
	[RoleId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUserTokens]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUserTokens](
	[UserId] [uniqueidentifier] NOT NULL,
	[LoginProvider] [nvarchar](450) NOT NULL,
	[Name] [nvarchar](450) NOT NULL,
	[Value] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[LoginProvider] ASC,
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AuditLogs]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogs](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NULL,
	[Action] [nvarchar](256) NOT NULL,
	[Ip] [nvarchar](64) NOT NULL,
	[Details] [nvarchar](max) NULL,
	[Timestamp] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BoatAvailability]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BoatAvailability](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[BoatId] [int] NOT NULL,
	[StartDate] [datetime2](7) NOT NULL,
	[EndDate] [datetime2](7) NOT NULL,
	[IsAvailable] [bit] NOT NULL,
	[Reason] [nvarchar](500) NULL,
	[ReferenceType] [nvarchar](100) NULL,
	[ReferenceId] [nvarchar](100) NULL,
	[Details] [nvarchar](2000) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BoatImages]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BoatImages](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[BoatId] [int] NOT NULL,
	[ImageUrl] [nvarchar](500) NOT NULL,
	[Caption] [nvarchar](500) NULL,
	[DisplayOrder] [int] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Destinations]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Destinations](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](200) NOT NULL,
	[Region] [nvarchar](200) NOT NULL,
	[Country] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[Image] [nvarchar](500) NULL,
	[AveragePrice] [decimal](10, 2) NOT NULL,
	[PopularMonths] [nvarchar](500) NULL,
	[Highlights] [nvarchar](max) NULL,
	[BoatCount] [int] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ExternalLogins]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ExternalLogins](
	[Id] [uniqueidentifier] NOT NULL,
	[Provider] [nvarchar](128) NOT NULL,
	[ProviderKey] [nvarchar](256) NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_ExternalLogins] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Messages]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Messages](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SenderId] [uniqueidentifier] NOT NULL,
	[ReceiverId] [uniqueidentifier] NOT NULL,
	[BookingId] [nvarchar](50) NULL,
	[BoatId] [int] NULL,
	[Subject] [nvarchar](500) NULL,
	[Content] [nvarchar](max) NOT NULL,
	[IsRead] [bit] NOT NULL,
	[ReadAt] [datetime2](7) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PasswordResetCodes]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PasswordResetCodes](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[CodeHash] [nvarchar](512) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[Used] [bit] NOT NULL,
	[Attempts] [int] NOT NULL,
	[Purpose] [nvarchar](100) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PasswordResetTokens]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PasswordResetTokens](
	[Id] [uniqueidentifier] NOT NULL,
	[Token] [nvarchar](512) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[Used] [bit] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_PasswordResetTokens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Profiles]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Profiles](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[Bio] [nvarchar](1024) NULL,
 CONSTRAINT [PK_Profiles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RefreshTokens]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshTokens](
	[Id] [uniqueidentifier] NOT NULL,
	[Token] [nvarchar](512) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[Revoked] [bit] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserDocuments]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserDocuments](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[DocumentType] [nvarchar](100) NOT NULL,
	[DocumentUrl] [nvarchar](500) NOT NULL,
	[BoatId] [int] NULL,
	[FileName] [nvarchar](256) NOT NULL,
	[FileSize] [bigint] NOT NULL,
	[IsVerified] [bit] NOT NULL,
	[VerifiedAt] [datetime2](7) NULL,
	[VerifiedBy] [uniqueidentifier] NULL,
	[UploadedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES (N'20bc2fa4-fde4-4d33-f248-08de2edb26ec', N'Admin', N'ADMIN', NULL)
GO
INSERT [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES (N'f3113cc2-aa54-48c2-f249-08de2edb26ec', N'Renter', N'RENTER', NULL)
GO
INSERT [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES (N'21e59c20-5091-48eb-f24a-08de2edb26ec', N'Owner', N'OWNER', NULL)
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'01a99673-f478-461f-a306-133221bcb452', N'20bc2fa4-fde4-4d33-f248-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'0f5469b4-0473-4726-b3a5-08de34f257ff', N'f3113cc2-aa54-48c2-f249-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'69ca6f05-839e-486d-fc01-08de34f94b11', N'f3113cc2-aa54-48c2-f249-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'540da5e9-b93a-45de-b3f0-ba67a883c2c6', N'f3113cc2-aa54-48c2-f249-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'f3113cc2-aa54-48c2-f249-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'758450e3-6bbe-4818-fc02-08de34f94b11', N'21e59c20-5091-48eb-f24a-08de2edb26ec')
GO
INSERT [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES (N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'21e59c20-5091-48eb-f24a-08de2edb26ec')
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'0f5469b4-0473-4726-b3a5-08de34f257ff', N'lharoti.socials@gmail.com', N'LHAROTI.SOCIALS@GMAIL.COM', N'lharoti.socials@gmail.com', N'LHAROTI.SOCIALS@GMAIL.COM', 1, N'AQAAAAIAAYagAAAAEEl5L2qPByuSvTdOU1ifNPx5gqsfkDyhq1QqPwgldHkvDh67x1AktDastUE/OUR+YA==', N'YL44PICLRWFPQYLC6KLVZTLXK3H5QDNJ', N'43768bfc-9558-4a76-a8c7-d2063727f683', N'+33760256909', 0, 0, NULL, 1, 0, N'Yassine', N'Lharoti', CAST(N'0001-01-01T00:00:00.0000000' AS DateTime2), N'7 avenue', N'pavillons sous bois', N'ile de france', N'93390', N'France', 0, N'renter', 0, CAST(N'2025-12-06T18:07:39.5025176' AS DateTime2), NULL, CAST(N'2025-12-06T18:07:39.5025180' AS DateTime2), CAST(N'2025-12-06T18:07:39.5025181' AS DateTime2), CAST(N'2025-12-06T18:09:42.4052543' AS DateTime2))
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'69ca6f05-839e-486d-fc01-08de34f94b11', N'lharoti.pro@gmail.com', N'LHAROTI.PRO@GMAIL.COM', N'lharoti.pro@gmail.com', N'LHAROTI.PRO@GMAIL.COM', 1, N'AQAAAAIAAYagAAAAEAShYVHf32Y/LHfjOVAac2NPewu+ftUsr6M++IXr6PRHEGrN5EkdqwrJhOq+06SVYw==', N'CKUZPV76IGPWNX5JGM372NGSMVHSENBB', N'39cf6985-a9d0-44cb-aad3-8a260611ec58', N'+760256909', 0, 0, NULL, 1, 0, N'lharoti', N'yassine', CAST(N'1991-03-30T00:00:00.0000000' AS DateTime2), N'7 avenue geroges pomipou', N'Paris', N'Seine saintde denis', N'75000', N'France', 0, N'renter', 0, CAST(N'2025-12-06T18:57:24.2400607' AS DateTime2), NULL, CAST(N'2025-12-06T18:57:24.2400611' AS DateTime2), CAST(N'2025-12-06T18:57:24.2400612' AS DateTime2), CAST(N'2025-12-06T22:28:01.8557086' AS DateTime2))
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'758450e3-6bbe-4818-fc02-08de34f94b11', N'Ikrammouttaki1996@gmail.com', N'IKRAMMOUTTAKI1996@GMAIL.COM', N'Ikrammouttaki1996@gmail.com', N'IKRAMMOUTTAKI1996@GMAIL.COM', 1, N'AQAAAAIAAYagAAAAEA/X2ABxA5o7uJdtvM6mg6o3UAiPXMG5LnxqSYAW9bWAhMe35zs0UqjoRHbs8b1uag==', N'SXYJE6JNPR53445HV7AT5EPJTG4TTWU3', N'48e3aada-d206-4c60-b633-96ddccd9cd09', N'+33652555500', 0, 0, NULL, 1, 0, N'ikram', N'Mouttaki', CAST(N'1995-06-05T00:00:00.0000000' AS DateTime2), N'1 rue Abujad', N'bordeaux', N'Bordeaux', N'95333', N'France', 0, N'owner', 0, CAST(N'2025-12-06T19:04:35.3966932' AS DateTime2), NULL, CAST(N'2025-12-06T19:04:35.3966933' AS DateTime2), CAST(N'2025-12-06T19:04:35.3966933' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'01a99673-f478-461f-a306-133221bcb452', N'voisinad7373', N'VOISINAD7373', N'voisinad7373@gmail.com', N'VOISINAD7373@GMAIL.COM', 1, N'AQAAAAIAAYagAAAAEIS7r9as2SYsfc9COjuW8QkhqCxarA7S28jt+YqBE/ZVSTdZ++6DyMm8mlACF4ZGiw==', N'YMKTAIBMHYSPQETFF3BRKKZGJYW7GJRI', N'b2a4fc3d-e27d-47c7-9afe-7d696274abd5', NULL, 0, 0, NULL, 1, 0, N'Ousrhih', N'Khalil', CAST(N'2005-11-29T00:10:56.7445980' AS DateTime2), N'', N'', N'', N'', N'', 0, N'admin', 0, CAST(N'2025-11-29T00:10:56.7439706' AS DateTime2), NULL, CAST(N'2025-11-29T00:10:56.7439709' AS DateTime2), CAST(N'2025-11-29T00:10:56.7439710' AS DateTime2), CAST(N'2025-12-07T12:13:37.3189026' AS DateTime2))
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', N'jean.dupont@example.com', N'JEAN.DUPONT@EXAMPLE.COM', N'jean.dupont@example.com', N'JEAN.DUPONT@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'49748D86-CDC0-425C-8411-0D340D6E6E3B', N'E6D8BC04-8809-476D-8CA0-59A1817815EE', N'+33612345678', 0, 0, NULL, 0, 0, N'Jean', N'Dupont', CAST(N'1988-01-01T00:00:00.0000000' AS DateTime2), N'', N'', N'', N'', N'France', 1, N'owner', 1, CAST(N'2023-11-29T17:23:51.2833333' AS DateTime2), NULL, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'3949fadd-19a7-40d9-9e53-8262f4af0947', N'marie.martin@example.com', N'MARIE.MARTIN@EXAMPLE.COM', N'marie.martin@example.com', N'MARIE.MARTIN@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'13531658-0DB3-4EB9-9AC4-6510D54C9A01', N'D7E65E73-97B9-436F-9EBB-1EE321D6DA9D', N'+33698765432', 0, 0, NULL, 0, 0, N'Marie', N'Martin', CAST(N'1990-01-01T00:00:00.0000000' AS DateTime2), N'', N'', N'', N'', N'France', 1, N'owner', 1, CAST(N'2024-05-29T17:23:51.2833333' AS DateTime2), NULL, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'thomas.petit@example.com', N'THOMAS.PETIT@EXAMPLE.COM', N'thomas.petit@example.com', N'THOMAS.PETIT@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'3A0FF3F0-4A59-4523-8B98-74EDC720AEF5', N'6E9FBF98-EF8B-4E6C-9A45-3834D56F9D50', N'+33687654321', 0, 0, NULL, 0, 0, N'Thomas', N'Petit', CAST(N'1995-01-01T00:00:00.0000000' AS DateTime2), N'', N'', N'', N'', N'France', 1, N'renter', 1, CAST(N'2024-11-29T17:23:51.2833333' AS DateTime2), NULL, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'c048f86d-4845-4486-95a7-994fbe25f261', N'admin@sailingloc.com', N'ADMIN@SAILINGLOC.COM', N'admin@sailingloc.com', N'ADMIN@SAILINGLOC.COM', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'332E4EF4-CFCF-470F-A941-565874B4D6BD', N'499136D9-5116-4896-913F-4BE1C37E8749', N'+33123456789', 0, 0, NULL, 0, 0, N'Administrateur', N'SailingLoc', CAST(N'1985-01-01T00:00:00.0000000' AS DateTime2), N'', N'', N'', N'', N'France', 1, N'renter', 1, CAST(N'2025-11-29T17:23:51.2800000' AS DateTime2), NULL, CAST(N'2025-11-29T17:23:51.2800000' AS DateTime2), CAST(N'2025-11-29T17:23:51.2800000' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'sophie.bernard@example.com', N'SOPHIE.BERNARD@EXAMPLE.COM', N'sophie.bernard@example.com', N'SOPHIE.BERNARD@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'E04A071C-025F-47E7-9252-E01B2687DC25', N'954B39F3-0541-4DA5-808D-37C7608D3E1D', N'+33676543210', 0, 0, NULL, 0, 0, N'Sophie', N'Bernard', CAST(N'1993-01-01T00:00:00.0000000' AS DateTime2), N'', N'', N'', N'', N'France', 1, N'renter', 1, CAST(N'2025-05-29T17:23:51.2833333' AS DateTime2), NULL, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'540da5e9-b93a-45de-b3f0-ba67a883c2c6', N'admin@local.test', N'ADMIN@LOCAL.TEST', N'admin@local.test', N'ADMIN@LOCAL.TEST', 1, N'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==', N'WWWIRYTOZ4XT5JG572R643NVBGNTUJBP', N'717cf6f6-638e-4ad0-b5d2-3b6e26313aa2', NULL, 0, 0, NULL, 1, 0, N'Admin', N'User', CAST(N'2005-11-29T00:10:57.3958000' AS DateTime2), N'', N'', N'', N'', N'', 0, N'owner', 0, CAST(N'2025-11-29T00:10:57.3957790' AS DateTime2), NULL, CAST(N'2025-11-29T00:10:57.3957793' AS DateTime2), CAST(N'2025-11-29T00:10:57.3957794' AS DateTime2), NULL)
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'Owner@local.test', N'OWNER@LOCAL.TEST', N'Owner@local.test', N'OWNER@LOCAL.TEST', 1, N'AQAAAAIAAYagAAAAEHB0cRIK4e5iJinzVaIWO4jBP7t/zIvgJQjB41QDHFQJxfKAmPFxR0eIcVkqtA89dA==', N'46ZGD34TMPDB3GV3BW2ZHGKJBJ42HWCB', N'9a18e879-2e65-467d-ab0a-8bbce520eb90', N'0663170174', 0, 0, NULL, 1, 0, N'Owner', N'User', CAST(N'1990-11-29T00:10:57.6800491' AS DateTime2), N'', N'Les pavillons sous bois', N'', N'93320', N'France', 0, N'renter', 0, CAST(N'2025-11-29T00:10:57.6800380' AS DateTime2), N'', CAST(N'2025-11-29T00:10:57.6800380' AS DateTime2), CAST(N'2025-11-29T00:10:57.6800381' AS DateTime2), CAST(N'2025-12-07T04:33:54.6009984' AS DateTime2))
GO
INSERT [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount], [FirstName], [LastName], [BirthDate], [Address_Street], [Address_City], [Address_State], [Address_PostalCode], [Address_Country], [Status], [UserType], [Verified], [MemberSince], [AvatarUrl], [CreatedAt], [UpdatedAt], [LastLoginAt]) VALUES (N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'Renter@local.test', N'RENTER@LOCAL.TEST', N'Renter@local.test', N'RENTER@LOCAL.TEST', 1, N'AQAAAAIAAYagAAAAEPKcSzUwOCekV0wdrP/YIh34SHQA4VOg+TOU2xdxgu92iNjUnPHeFScW56vmFZu9Yw==', N'PU45TBJ3H4277N6LWM6XP57HHLIDL46V', N'90cbcc93-5d31-4eac-bc55-500a5909ab4d', N'0663170174', 0, 0, NULL, 1, 0, N'Renter', N'User', CAST(N'1995-11-29T00:10:57.5392803' AS DateTime2), N'7 avenue georges pompidou', N'Les pavillons sous bois', N'Seine saint denis', N'93320', N'France', 0, N'admin', 0, CAST(N'2025-11-29T00:10:57.5392649' AS DateTime2), NULL, CAST(N'2025-11-29T00:10:57.5392650' AS DateTime2), CAST(N'2025-11-29T00:10:57.5392650' AS DateTime2), CAST(N'2025-12-07T04:06:02.7474866' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[BoatAvailability] ON 
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (1, 1, CAST(N'2025-06-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-06-30T00:00:00.0000000' AS DateTime2), 1, NULL, NULL, NULL, NULL, CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (2, 1, CAST(N'2025-07-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-07-07T00:00:00.0000000' AS DateTime2), 0, N'Révision moteur', NULL, NULL, NULL, CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (3, 2, CAST(N'2025-07-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-07-31T00:00:00.0000000' AS DateTime2), 1, NULL, NULL, NULL, NULL, CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (4, 2, CAST(N'2025-08-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-08-15T00:00:00.0000000' AS DateTime2), 0, N'Bloqué par le propriétaire', NULL, NULL, NULL, CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (5, 5, CAST(N'2025-08-01T00:00:00.0000000' AS DateTime2), CAST(N'2025-08-31T00:00:00.0000000' AS DateTime2), 1, NULL, NULL, NULL, NULL, CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (6, 1, CAST(N'2026-01-01T00:00:00.0000000' AS DateTime2), CAST(N'2026-01-04T00:00:00.0000000' AS DateTime2), 0, N'Usage personnel', N'blocked', NULL, NULL, CAST(N'0001-01-01T00:00:00.0000000' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (7, 1, CAST(N'2025-12-07T00:00:00.0000000' AS DateTime2), CAST(N'2025-12-10T00:00:00.0000000' AS DateTime2), 0, NULL, N'booking', N'BK20251206-3fc0fad9', NULL, CAST(N'2025-12-06T17:38:47.5270510' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (8, 1, CAST(N'2025-12-17T00:00:00.0000000' AS DateTime2), CAST(N'2025-12-20T00:00:00.0000000' AS DateTime2), 0, NULL, N'booking', N'BK20251206-39d0a187', NULL, CAST(N'2025-12-06T17:42:02.5947706' AS DateTime2))
GO
INSERT [dbo].[BoatAvailability] ([Id], [BoatId], [StartDate], [EndDate], [IsAvailable], [Reason], [ReferenceType], [ReferenceId], [Details], [CreatedAt]) VALUES (10, 1, CAST(N'2026-02-03T00:00:00.0000000' AS DateTime2), CAST(N'2026-04-10T00:00:00.0000000' AS DateTime2), 0, N'Réservation Client', N'booking', N'BK20251206-962b1af5', NULL, CAST(N'2025-12-06T18:11:01.9613320' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[BoatAvailability] OFF
GO
SET IDENTITY_INSERT [dbo].[BoatImages] ON 
GO
INSERT [dbo].[BoatImages] ([Id], [BoatId], [ImageUrl], [Caption], [DisplayOrder], [CreatedAt]) VALUES (7, 4, N'https://images.boatsgroup.com/resize/1/35/51/2007-bavaria-46-cruiser-sail-9943551-20250912091804684-1.jpg?w=400&h=267&t=1757694787000&exact&format=webp', N'Yacht Prestige 520 Fly', 1, CAST(N'2025-11-29T17:23:51.3300000' AS DateTime2))
GO
INSERT [dbo].[BoatImages] ([Id], [BoatId], [ImageUrl], [Caption], [DisplayOrder], [CreatedAt]) VALUES (8, 15, N'https://www.moorings.com/sites/default/files/styles/boat_full/public/FP-Elba-45-Exterior-2.jpg', N'Yacht Prestige 520 Fly', 0, CAST(N'2025-12-07T02:46:07.7488448' AS DateTime2))
GO
INSERT [dbo].[BoatImages] ([Id], [BoatId], [ImageUrl], [Caption], [DisplayOrder], [CreatedAt]) VALUES (9, 15, N'https://www.moorings.com/sites/default/files/styles/boat_full/public/FP-Elba-45-Exterior-3.jpg', N'Yacht Prestige 520 Fly', 1, CAST(N'2025-12-07T02:46:07.7491261' AS DateTime2))
GO
INSERT [dbo].[BoatImages] ([Id], [BoatId], [ImageUrl], [Caption], [DisplayOrder], [CreatedAt]) VALUES (11, 4, N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREwSohxzuTCB9XDXLw4m4IBEL3UuO-DhnkjA&s', N'Yacht Prestige 520 Fly', 2, CAST(N'2025-12-07T03:38:58.8100000' AS DateTime2))
GO
INSERT [dbo].[BoatImages] ([Id], [BoatId], [ImageUrl], [Caption], [DisplayOrder], [CreatedAt]) VALUES (12, 4, N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-UNq_euVtkS92S5fmnSeOrosoaKE61zMEAQ&s', N'Yacht Prestige 520 Fly', 3, CAST(N'2025-12-07T03:38:58.8100000' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[BoatImages] OFF
GO
SET IDENTITY_INSERT [dbo].[Boats] ON 
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (1, N'Bénéteau Oceanis 45', N'sailboat', N'Nice', N'Nice', 1, N'France', CAST(350.00 AS Decimal(10, 2)), 8, 4, CAST(13.50 AS Decimal(5, 2)), 2018, N'https://www.beneteau.com/sites/default/files/styles/standard_large/public/oceanis45_0125formatok.jpg.webp?itok=bHB2hcsg', CAST(5.00 AS Decimal(3, 2)), 2, N'["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]', N'Magnifique voilier pour découvrir la Côte d''Azur', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3500000' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (2, N'Lagoon 42 Premium', N'catamaran', N'Athènes', N'Athènes', 2, N'Grèce', CAST(580.00 AS Decimal(10, 2)), 10, 4, CAST(12.80 AS Decimal(5, 2)), 2020, N'https://admin.catamarans-lagoon.com/sites/default/files/2023-06/Lagoon%2042%20navigation%20voile_0.jpg', CAST(5.00 AS Decimal(3, 2)), 2, N'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', N'Catamaran de luxe pour explorer les Cyclades', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-12-07T05:15:16.6310893' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (3, N'Jeanneau Sun Odyssey 419', N'sailboat', N'Ajaccio', N'Ajaccio', 3, N'France', CAST(320.00 AS Decimal(10, 2)), 8, 3, CAST(12.50 AS Decimal(5, 2)), 2019, N'https://images.boatsgroup.com/resize/1/4/60/2018-jeanneau-sun-odyssey-419-sail-9710460-20250311082926238-1_XLARGE.jpg?w=400&h=267&t=1741707197000&exact&format=webp', CAST(5.00 AS Decimal(3, 2)), 1, N'["GPS","Guindeau électrique","Annexe"]', N'Idéal pour naviguer autour de la Corse', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3500000' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (4, N'Bavaria Cruiser 46', N'sailboat', N'Split', N'Split', 4, N'Croatie', CAST(380.00 AS Decimal(10, 2)), 10, 4, CAST(14.30 AS Decimal(5, 2)), 2017, N'https://dgbstore.blob.core.windows.net/images/22/2709/d280df9e-066b-4325-b656-9f70a230bdcf/71b8e015-ca2f-4d93-9c5e-5b0209ccc658.2048.jpg', CAST(4.00 AS Decimal(3, 2)), 1, N'Annexe avec moteur,GPS,Pilote automatique,Guindeau électrique,Plateforme de bain,Barbecue,Matériel de plongée', N'The Bavaria Cruiser 46 is l’un des voiliers de croisière les plus polyvalents et appréciés de sa catégorie. Spacieux, confortable et parfaitement équilibré en navigation, il offre une expérience maritime idéale aussi bien pour les familles que pour les groupes d’amis souhaitant découvrir la Méditerranée.

À bord, vous profiterez d’un cockpit large et sécurisé, d’un poste de barre ergonomique et d’une excellente stabilité grâce à sa carène moderne. L’intérieur est lumineux, bien ventilé et propose 4 cabines confortables, parfaites pour des navigations de plusieurs jours. Le voilier est entièrement équipé pour garantir une croisière agréable : GPS, pilote automatique, guindeau électrique, annexe motorisée, et bien plus encore.

Le Bavaria Cruiser 46 combine performance, fiabilité et confort, ce qui en fait l’un des meilleurs choix pour un séjour en mer réussi.', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3500000' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (5, N'Fountaine Pajot Astrea 42', N'catamaran', N'Palma', N'Palma de Majorque', 5, N'Espagne', CAST(520.00 AS Decimal(10, 2)), 10, 4, CAST(12.60 AS Decimal(5, 2)), 2021, N'https://www.croatia-yachting-charter.com/images/yacht/fountaine-pajot-astrea-42/48057859-ocean-allure/48057859-main.JPG', CAST(5.00 AS Decimal(3, 2)), 1, N'["GPS","Pilote automatique","Climatisation","Dessalinisateur"]', N'Catamaran moderne pour les Baléares', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-12-07T05:19:29.0524659' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (6, N'Dufour 460 Grand Large', N'sailboat', N'La Rochelle', N'La Rochelle', 6, N'France', CAST(420.00 AS Decimal(10, 2)), 10, 5, CAST(14.15 AS Decimal(5, 2)), 2019, N'https://www.felciyachtdesign.com/wp-content/uploads/2017/10/DUFOUR460-x-sito-1-1900x960.jpg', CAST(4.80 AS Decimal(3, 2)), 11, N'["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]', N'Grand voilier confortable pour la Bretagne', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (7, N'Bali 4.3 Catamaran', N'catamaran', N'Cagliari', N'Cagliari', 7, N'Italie', CAST(550.00 AS Decimal(10, 2)), 12, 4, CAST(13.10 AS Decimal(5, 2)), 2020, N'https://www.belle-croisiere.com/sites/default/files/flotte/bali-4.3-promo-grece-.jpg', CAST(5.00 AS Decimal(3, 2)), 1, N'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', N'Catamaran spacieux pour la Sardaigne', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3500000' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (8, N'Zodiac Medline 850', N'semirigid', N'Nice', N'Nice', 1, N'France', CAST(180.00 AS Decimal(10, 2)), 12, 0, CAST(8.50 AS Decimal(5, 2)), 2021, N'https://www.docksideyachtinggroup.com/wp-content/uploads/2022/02/l_in01-large.jpg', CAST(4.50 AS Decimal(3, 2)), 6, N'["GPS","Sondeur","Bimini","Échelle de bain"]', N'Semi-rigide rapide pour balades côtières', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (9, N'Bavaria 50 Cruiser', N'sailboat', N'Mykonos', N'Mykonos', 2, N'Grèce', CAST(450.00 AS Decimal(10, 2)), 12, 5, CAST(15.40 AS Decimal(5, 2)), 2018, N'https://static.theglobesailor.com/1842x600/filters:quality(60)/filters:no_upscale()/boatmodel/bavaria-50-cruiser-575272e2-321b-4aa6-a7c6-63dac93db206.jpg', CAST(4.70 AS Decimal(3, 2)), 13, N'["GPS","Pilote automatique","Climatisation","Guindeau électrique"]', N'Grand voilier luxueux pour les Cyclades', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (10, N'Prestige 520 Fly', N'motor', N'Cannes', N'Cannes', 1, N'France', CAST(890.00 AS Decimal(10, 2)), 8, 3, CAST(15.90 AS Decimal(5, 2)), 2019, N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTefoNb86U_YLMMKAU4GCR9Wcph0ti5dLXPAg&s', CAST(5.00 AS Decimal(3, 2)), 1, N'["GPS","Pilote automatique","Climatisation","Bow thruster","Annexe avec moteur"]', N'Yacht à moteur de prestige', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3500000' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (11, N'Jeanneau Leader 30', N'motor', N'Saint-Tropez', N'Saint-Tropez', 1, N'France', CAST(420.00 AS Decimal(10, 2)), 6, 1, CAST(9.14 AS Decimal(5, 2)), 2020, N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTnsMcT0hPD2A2t42blf8lh-I35S0Y1d_H5Q&s', CAST(4.60 AS Decimal(3, 2)), 10, N'["GPS","Sondeur","Bimini","Plateforme de bain"]', N'Bateau à moteur idéal pour la journée', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (12, N'Hanse 458', N'sailboat', N'Porto-Vecchio', N'Porto-Vecchio', 3, N'France', CAST(410.00 AS Decimal(10, 2)), 10, 4, CAST(14.00 AS Decimal(5, 2)), 2018, N'https://hanseyachts.hr/images/ownership/yacht-images/hanse-458/hanse-458-heading_bg.jpg', CAST(4.80 AS Decimal(3, 2)), 12, N'["GPS","Pilote automatique","Guindeau électrique"]', N'Voilier performant et confortable', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (13, N'Lagoon 450 F', N'catamaran', N'Rhodes', N'Rhodes', 2, N'Grèce', CAST(620.00 AS Decimal(10, 2)), 12, 4, CAST(13.96 AS Decimal(5, 2)), 2017, N'https://admin.catamarans-lagoon.com/sites/default/files/2023-06/_45R6992%20%283%29.jpg', CAST(5.00 AS Decimal(3, 2)), 1, N'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]', N'Catamaran spacieux et rapide', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), CAST(N'2025-11-29T17:23:51.3533333' AS DateTime2), 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (14, N'Bénéteau First 40.7', N'sailboat', N'Barcelone', N'Barcelone', 5, N'Espagne', CAST(290.00 AS Decimal(10, 2)), 8, 3, CAST(12.37 AS Decimal(5, 2)), 2016, N'https://www.beneteau.com/sites/default/files/styles/standard_large/public/3810-82.jpg-1832_0.jpg.webp?itok=uyBVKBRE', CAST(4.50 AS Decimal(3, 2)), 14, N'["GPS","Pilote automatique","Guindeau électrique"]', N'Voilier sportif et maniable', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-11-29T17:23:51.2900000' AS DateTime2), NULL, 0)
GO
INSERT [dbo].[Boats] ([Id], [Name], [Type], [Location], [City], [DestinationId], [Country], [Price], [Capacity], [Cabins], [Length], [Year], [Image], [Rating], [ReviewCount], [Equipment], [Description], [OwnerId], [IsActive], [IsVerified], [CreatedAt], [UpdatedAt], [IsDeleted]) VALUES (15, N'Fountaine Pajot Elba 45', N'catamaran', N'Vieux-Port de Marseille', N'Marseille', NULL, N'France', CAST(890.00 AS Decimal(10, 2)), 4, 4, CAST(13.45 AS Decimal(5, 2)), 2021, N'https://www.moorings.com/sites/default/files/styles/boat_full/public/FP-Elba-45-Exterior-1.jpg', CAST(0.00 AS Decimal(3, 2)), 0, N'GPS,Annexe avec moteur,Climatisation,Pilote automatique,Guindeau électrique,Dessalinisateur,Sonar,VHF MARINE,BIMINI TOP', N'Catamaran de luxe récent, spacieux et parfaitement équipé pour des croisières haut de gamme en Méditerranée. Le Fountaine Pajot Elba 45 offre un confort exceptionnel, une stabilité remarquable et un espace de vie lumineux. Parfait pour des vacances en famille ou entre amis.', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', 1, 1, CAST(N'2025-12-07T02:46:07.7475422' AS DateTime2), CAST(N'2025-12-07T05:22:53.5847019' AS DateTime2), 0)
GO
SET IDENTITY_INSERT [dbo].[Boats] OFF
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK202501', 1, N'518c74cd-3279-4dc2-8a6c-8c074df43835', CAST(N'2025-06-15' AS Date), CAST(N'2025-06-22' AS Date), CAST(350.00 AS Decimal(10, 2)), CAST(2450.00 AS Decimal(10, 2)), CAST(245.00 AS Decimal(10, 2)), CAST(2695.00 AS Decimal(10, 2)), N'pending', N'Thomas Petit', N'thomas.petit@example.com', NULL, NULL, N'succeeded', NULL, CAST(N'2025-11-29T17:23:51.3466667' AS DateTime2), NULL, NULL)
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK202502', 2, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', CAST(N'2025-07-01' AS Date), CAST(N'2025-07-08' AS Date), CAST(580.00 AS Decimal(10, 2)), CAST(4060.00 AS Decimal(10, 2)), CAST(406.00 AS Decimal(10, 2)), CAST(4466.00 AS Decimal(10, 2)), N'confirmed', N'Sophie Bernard', N'sophie.bernard@example.com', NULL, NULL, N'succeeded', NULL, CAST(N'2025-11-29T17:23:51.3466667' AS DateTime2), CAST(N'2025-12-07T03:43:53.7472954' AS DateTime2), CAST(N'2025-12-07T00:49:11.8480289' AS DateTime2))
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK202503', 5, N'518c74cd-3279-4dc2-8a6c-8c074df43835', CAST(N'2025-08-10' AS Date), CAST(N'2025-08-17' AS Date), CAST(520.00 AS Decimal(10, 2)), CAST(3640.00 AS Decimal(10, 2)), CAST(364.00 AS Decimal(10, 2)), CAST(4004.00 AS Decimal(10, 2)), N'pending', N'Thomas Petit', N'thomas.petit@example.com', NULL, NULL, N'pending', NULL, CAST(N'2025-11-29T17:23:51.3466667' AS DateTime2), NULL, NULL)
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK20251206-1df77fa3', 12, N'69ca6f05-839e-486d-fc01-08de34f94b11', CAST(N'2025-12-08' AS Date), CAST(N'2025-12-13' AS Date), CAST(410.00 AS Decimal(10, 2)), CAST(2050.00 AS Decimal(10, 2)), CAST(205.00 AS Decimal(10, 2)), CAST(2255.00 AS Decimal(10, 2)), N'cancelled', N'lharoti yassine', N'lharoti.pro@gmail.com', NULL, NULL, N'succeeded', CAST(N'2025-12-06T22:28:18.3360839' AS DateTime2), CAST(N'2025-12-06T22:28:18.3363205' AS DateTime2), CAST(N'2025-12-07T00:49:41.1811381' AS DateTime2), CAST(N'2025-12-07T00:49:52.5953336' AS DateTime2))
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK20251206-39d0a187', 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-17' AS Date), CAST(N'2025-12-20' AS Date), CAST(350.00 AS Decimal(10, 2)), CAST(1050.00 AS Decimal(10, 2)), CAST(105.00 AS Decimal(10, 2)), CAST(1155.00 AS Decimal(10, 2)), N'pending', N'Renter User', N'Renter@local.test', NULL, NULL, N'succeeded', CAST(N'2025-12-06T17:42:02.5782316' AS DateTime2), CAST(N'2025-12-06T17:42:02.5782347' AS DateTime2), NULL, NULL)
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK20251206-3fc0fad9', 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-07' AS Date), CAST(N'2025-12-10' AS Date), CAST(350.00 AS Decimal(10, 2)), CAST(1050.00 AS Decimal(10, 2)), CAST(105.00 AS Decimal(10, 2)), CAST(1155.00 AS Decimal(10, 2)), N'pending', N'Renter User', N'Renter@local.test', NULL, NULL, N'succeeded', CAST(N'2025-12-06T17:37:58.1946911' AS DateTime2), CAST(N'2025-12-06T17:37:58.2477784' AS DateTime2), NULL, NULL)
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK20251206-4a96e80f', 6, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-10' AS Date), CAST(N'2025-12-14' AS Date), CAST(420.00 AS Decimal(10, 2)), CAST(1680.00 AS Decimal(10, 2)), CAST(168.00 AS Decimal(10, 2)), CAST(1848.00 AS Decimal(10, 2)), N'cancelled', N'Renter User', N'Renter@local.test', NULL, NULL, N'succeeded', CAST(N'2025-12-06T17:44:37.4175919' AS DateTime2), CAST(N'2025-12-06T17:44:37.4179976' AS DateTime2), CAST(N'2025-12-07T00:50:20.3417469' AS DateTime2), CAST(N'2025-12-07T00:50:24.9849276' AS DateTime2))
GO
INSERT [dbo].[Bookings] ([Id], [BoatId], [RenterId], [StartDate], [EndDate], [DailyPrice], [Subtotal], [ServiceFee], [TotalPrice], [Status], [RenterName], [RenterEmail], [RenterPhone], [PaymentIntentId], [PaymentStatus], [PaidAt], [CreatedAt], [UpdatedAt], [CancelledAt]) VALUES (N'BK20251206-962b1af5', 1, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2026-02-03' AS Date), CAST(N'2026-04-10' AS Date), CAST(350.00 AS Decimal(10, 2)), CAST(23100.00 AS Decimal(10, 2)), CAST(2310.00 AS Decimal(10, 2)), CAST(25410.00 AS Decimal(10, 2)), N'pending', N'Yassine Lharoti', N'lharoti.socials@gmail.com', NULL, NULL, N'succeeded', CAST(N'2025-12-06T18:11:01.8361729' AS DateTime2), CAST(N'2025-12-06T18:11:01.8365916' AS DateTime2), NULL, NULL)
GO
SET IDENTITY_INSERT [dbo].[Destinations] ON 
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (1, N'Côte d''Azur', N'Provence-Alpes-Côte d''Azur', N'France', N'La Côte d''Azur offre des eaux cristallines et des paysages exceptionnels.', N'https://images.squarespace-cdn.com/content/v1/6001ce695a503d6d70ef3775/4f83b757-122e-4caa-9f5a-d429dc2c0278/plus+belles+plages+cote+d+azur', CAST(450.00 AS Decimal(10, 2)), N'["Mai","Juin","Juillet","Août","Septembre"]', N'["Calanques de Cassis","Îles de Lérins","Saint-Tropez","Monaco","Antibes"]', 4, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-05T20:55:31.6366667' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (2, N'Grèce', N'Méditerranée', N'Grèce', N'Explorez les îles grecques et leur beauté intemporelle.', N' https://res.cloudinary.com/lastminute-contenthub/s--JyekpJqZ--/c_crop,h_3000,w_4500,x_0,y_0/c_limit,h_999999,w_1920/f_auto/q_auto:eco/v1/DAM/Photos/Destinations/Europe/Greece/Santorini/shutterstock_132953783', CAST(380.00 AS Decimal(10, 2)), N'["Juin","Juillet","Août","Septembre"]', N'["Santorin","Mykonos","Cyclades","Îles Ioniennes","Crète"]', 3, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-07T05:15:16.7300000' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (3, N'Corse', N'Corse', N'France', N'L''île de beauté avec ses criques sauvages et ses montagnes.', N'https://www.kalysteo.com/album/iles-lavezzi.jpg', CAST(420.00 AS Decimal(10, 2)), N'["Juin","Juillet","Août","Septembre"]', N'["Bonifacio","Calvi","Porto-Vecchio","Réserve de Scandola","Calanques de Piana"]', 2, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-05T20:56:03.3700000' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (4, N'Croatie', N'Adriatique', N'Croatie', N'Des milliers d''îles à découvrir le long de la côte dalmate.', N'https://www.escale-en-croatie.com/uploads/sites/29/2019/08/janoka82.jpeg', CAST(350.00 AS Decimal(10, 2)), N'["Mai","Juin","Juillet","Août","Septembre"]', N'["Dubrovnik","Split","Îles Kornati","Hvar","Zadar"]', 1, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-07T03:23:58.8333333' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (5, N'Baléares', N'Îles Baléares', N'Espagne', N'Majorque, Minorque, Ibiza et Formentera vous attendent.', N'https://chouetteworld.com/wp-content/uploads/2022/01/beach-ge9d383ffa_1920.jpg', CAST(320.00 AS Decimal(10, 2)), N'["Mai","Juin","Juillet","Août","Septembre","Octobre"]', N'["Majorque","Minorque","Ibiza","Formentera","Cabrera"]', 2, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-07T05:19:29.0633333' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (6, N'Bretagne', N'Bretagne', N'France', N'Découvrez les côtes bretonnes et leurs traditions maritimes.', N'https://www.okvoyage.com/wp-content/uploads/2022/10/les-plus-beaux-paysages-de-bretagne-1536x1024.jpg', CAST(280.00 AS Decimal(10, 2)), N'["Juin","Juillet","Août"]', N'["Golfe du Morbihan","Belle-Île","Archipel des Glénan","Roscoff","Cancale"]', 1, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-05T20:53:09.1066667' AS DateTime2))
GO
INSERT [dbo].[Destinations] ([Id], [Name], [Region], [Country], [Description], [Image], [AveragePrice], [PopularMonths], [Highlights], [BoatCount], [CreatedAt], [UpdatedAt]) VALUES (7, N'Sardaigne', N'Sardaigne', N'Italie', N'Eaux turquoise et plages paradisiaques de la Méditerranée.', N'https://ulysse.com/news/wp-content/uploads/2024/03/La-Cala-Corsara-en-Sardaigne-Italie.jpg', CAST(390.00 AS Decimal(10, 2)), N'["Juin","Juillet","Août","Septembre"]', N'["Costa Smeralda","Archipel de La Maddalena","Alghero","Cagliari","Golfe d''Orosei"]', 1, CAST(N'2025-11-29T17:23:51.2833333' AS DateTime2), CAST(N'2025-12-05T20:53:34.8366667' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[Destinations] OFF
GO
SET IDENTITY_INSERT [dbo].[Messages] ON 
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (1, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', N'BK202501', 1, N'Question sur l''embarquement', N'Bonjour, à quelle heure pouvons-nous embarquer le premier jour ?', 0, NULL, CAST(N'2025-11-29T17:23:51.3466667' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (2, N'06d9fafd-6c27-4f6c-b7dd-233f6bb8f6f6', N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'BK202501', 1, N'Re: Question sur l''embarquement', N'Bonjour Thomas, vous pouvez embarquer à partir de 15h au port de Nice.', 0, NULL, CAST(N'2025-11-29T17:28:51.3466667' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (3, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'BK202502', 2, N'Itinéraire conseillé dans les Cyclades', N'Bonjour, avez-vous des suggestions d''itinéraire pour une semaine ?', 0, NULL, CAST(N'2025-11-29T17:23:51.3466667' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (4, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'BK20251206-4a96e80f', 6, N'Message from renter about booking BK20251206-4a96e80f', N'hey', 1, CAST(N'2025-12-06T21:30:14.0293314' AS DateTime2), CAST(N'2025-12-06T21:25:14.0293314' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (5, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'BK20251206-4a96e80f', 6, N'Message from owner about booking BK20251206-4a96e80f', N'Salut Cher locataire', 1, CAST(N'2025-12-06T21:32:14.0293314' AS DateTime2), CAST(N'2025-12-06T21:32:14.0293314' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (7, N'69ca6f05-839e-486d-fc01-08de34f94b11', N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'BK20251206-1df77fa3', 12, N'Message from renter about booking BK20251206-1df77fa3', N'j''ai reservéer', 1, CAST(N'2025-12-06T22:28:35.9331014' AS DateTime2), CAST(N'2025-12-06T22:28:35.9331014' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (8, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'69ca6f05-839e-486d-fc01-08de34f94b11', N'BK20251206-1df77fa3', 12, N'Message from owner about booking BK20251206-1df77fa3', N'ok', 1, CAST(N'2025-12-06T22:29:03.7292071' AS DateTime2), CAST(N'2025-12-06T22:29:03.7292071' AS DateTime2))
GO
INSERT [dbo].[Messages] ([Id], [SenderId], [ReceiverId], [BookingId], [BoatId], [Subject], [Content], [IsRead], [ReadAt], [CreatedAt]) VALUES (9, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'BK202502', 2, N'Message from owner about booking BK202502', N'hello', 0, NULL, CAST(N'2025-12-07T03:44:07.1222848' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[Messages] OFF
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'caace910-b37d-4417-a864-0028dcb1d458', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEPrcsmP8mn870oXhkGXVJlgOYC5V5yS64KwKwtEDV4QVP1Excz0E4S6kz+tMU9xZyQ==', CAST(N'2025-11-29T21:26:56.2373408' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:16:56.2373371' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'4b9ec516-f2a6-46f4-b240-13966338d57c', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEJ3Br/sb0zc39xTSkQaWoNXOuk43sMLmupnSzjNFDFMRxbhDD2sWNJlCMfIJSCK1vA==', CAST(N'2025-11-29T21:45:17.7826646' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:35:17.7826615' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'fd52a805-1b20-4c26-8fb8-1e842912283f', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEGnx/kc5cYU7Z1G+xgArzPTkTG3tGTPipZ28hW0WRVugS5MQQzeVR3j2yB3B6rFGHA==', CAST(N'2025-11-29T22:00:14.1465318' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:50:14.1465301' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'17b17f04-6b40-47a2-b684-236c15ed4507', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEEgfB3csZ/8gLofnLjauApbmQvQds71gDAcXqCm2MpaoLa8i1++UA0vhngWgiZUiGw==', CAST(N'2025-11-29T21:39:48.2988057' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:29:48.2986626' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'af08e640-c64a-4c24-8c97-2d110c520f01', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEOx5QrwIFhICxReLmHNevw7atcJ1aiBgR4EmUw2zKrTVrXbjn1GCqw2HNPcuHmUMAw==', CAST(N'2025-12-06T16:27:44.7373026' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-12-06T16:17:44.7370912' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'194594ec-d8e3-4265-be25-403e7ea1ce68', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEPHlH9Psqpnz3sbU+83Xwqi8DW1+iDIeTXPMu8ZSTBQEDu3nxjoxoAZHdBf1LyR6VQ==', CAST(N'2025-11-29T21:48:48.9456776' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:38:48.9454302' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'475133c0-875e-4794-aa14-5f459e05fe3d', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEGdIN6yM7GoYpMfrE4XwC1zwYtB+anQfLYEghLggmBMxcjN/jZOZ2yKccJODzsxQOQ==', CAST(N'2025-11-29T21:24:50.8964168' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:14:50.8961723' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'eb98032b-dfc0-4f09-960a-7be3926c6cd9', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEGfMSQZ9x1dgzrJCquooP48TwUTId+JWrW00gu2dLEmC764L867FsDgZaIKE9sVQiQ==', CAST(N'2025-11-29T21:49:45.7023579' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:39:45.7022359' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'2a68a9d5-f67c-42a5-a5e8-9233c6d6c554', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEGlDR/yOOexp5loXVoXPQkE05sb8P05l7czesMjpuzdjSnEUS2vjJtB75JdKMcR3GA==', CAST(N'2025-11-29T21:35:48.4117661' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:25:48.4117626' AS DateTime2))
GO
INSERT [dbo].[PasswordResetCodes] ([Id], [UserId], [CodeHash], [ExpiresAt], [Used], [Attempts], [Purpose], [CreatedAt]) VALUES (N'3754e9ad-bbb7-47ba-8072-b1743da0c576', N'01a99673-f478-461f-a306-133221bcb452', N'AQAAAAIAAYagAAAAEDpYAZvMdPPS8FACNoFuz9oTtRwDWVHRT2NiPMWRHvaNSMKWI9cNRQTRH5HwYf29lw==', CAST(N'2025-11-29T21:46:47.0676045' AS DateTime2), 1, 0, N'password-reset', CAST(N'2025-11-29T21:36:47.0676005' AS DateTime2))
GO
INSERT [dbo].[PasswordResetTokens] ([Id], [Token], [ExpiresAt], [Used], [UserId], [CreatedAt]) VALUES (N'ad1fb913-a07e-467f-97a7-8e8daa5dd78f', N'trT4w/udFE6Gytlrqf+McQ==', CAST(N'2025-11-29T22:39:59.3099928' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T21:39:59.3098312' AS DateTime2))
GO
INSERT [dbo].[PasswordResetTokens] ([Id], [Token], [ExpiresAt], [Used], [UserId], [CreatedAt]) VALUES (N'78ab91ff-ae81-40b1-bb97-a770338fc56f', N'rfylqdfhMEaD2tlfsFarDQ==', CAST(N'2025-12-06T17:18:03.8838044' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-06T16:18:03.8834504' AS DateTime2))
GO
INSERT [dbo].[PasswordResetTokens] ([Id], [Token], [ExpiresAt], [Used], [UserId], [CreatedAt]) VALUES (N'77bacf49-7e4e-4368-a5a7-f1630f6cb815', N'15RKvIz8I0CQj58dMdJZHA==', CAST(N'2025-11-29T22:50:35.3050548' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T21:50:35.3050513' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e6522136-05f8-44b4-9e24-00a89994c3d5', N'lsQmyLfHy0ilhyfN+T/j9w==i7wCEpqm90e886P5TEa+eg==', CAST(N'2025-12-30T07:52:37.8452222' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T07:52:37.8452132' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'53f6b516-f6d1-4d68-acea-0436ba7a458a', N'NhRScM1n0Ee0DfReQcQvfw==rPvM08mzTUqMvulQbzU/AQ==', CAST(N'2025-12-30T10:17:38.3450400' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T10:17:38.3450315' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'f691d46b-6543-4173-962d-045eff232329', N'7lKztCgUJUe9VhSRXigaDw==uaV4f+bSn0Wuue5GLAkcFw==', CAST(N'2026-01-05T21:56:31.7679945' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7679842' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'2b1d241c-f144-425d-836c-0641c718b828', N'qdteoUAy+U6S6CIQWnUleQ==0s0gqBTtgkCoFkR34dwkOA==', CAST(N'2026-01-05T21:01:22.9616501' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T21:01:22.9615854' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'886e0805-0e69-4ec7-833a-07a44c44ea1f', N'U9gnIWoH90OeJDzKK/YJDg==vF9hRTEjWUCL437ZqjZaLA==', CAST(N'2026-01-05T23:46:21.4302368' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T23:46:21.4281693' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'86a00862-2542-4791-8518-093c62e2a408', N'brgM8JKgFkiGE7fmJkTn8g==HPlcFi4rYUeEsk4S7bzxyw==', CAST(N'2026-01-06T03:11:49.6247706' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:11:49.6229145' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8ea5af6a-0734-4766-ba91-09482820aef9', N'XIjQCavKsUWdklkfauHC2w==WIaMUAHkrUa5rRKLyXO5mg==', CAST(N'2026-01-05T21:56:31.7240904' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7226864' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'f4e6361a-185b-43ef-8962-0c93f2bcd2ef', N'QosqOI2PpU2jxJR2/5sjoQ==K8C0qvIh+EqVl2gE8bBOag==', CAST(N'2026-01-05T21:17:36.2980971' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T21:17:36.2966307' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a7b46d49-50ff-4149-b64f-0d54b207c37c', N'/0GXLZyTkEC4EsWSexrn7g==re4X2HRR5EiASf+IXHSoKg==', CAST(N'2026-01-05T18:09:42.2068878' AS DateTime2), 1, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:09:42.2059399' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'c689524a-7c75-41f8-ad1f-0e2981736ca5', N'wwWz2he4lk20g95GVYTdew==0QoL7DlNCUeb2OtGLUP4IQ==', CAST(N'2025-12-30T10:36:08.6253225' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T10:36:08.6241918' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4c742945-14ec-4f7a-97d7-0e66ebae5aac', N'wWFw3usEqUa7+0cMPMYkMg==dxzJlvtHVk+pqkoPZ/LgqQ==', CAST(N'2026-01-06T00:37:21.6762254' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:21.6762148' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'0304fb76-88eb-4c1c-b41c-1090866cda9c', N'FMxvAzBbMEqE9RAzt1EyMg==EnWI4tLNvkCMkIqdoQUtcA==', CAST(N'2026-01-05T00:13:28.2657153' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T00:13:28.2657048' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'def5610c-74bd-47d4-8bca-121a8618937e', N'mRIIAdzTK0K1bTnlumE1Yw==vSnFv27gu0CZq9yonQxkjw==', CAST(N'2026-01-06T04:59:11.3930120' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:11.3930023' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'fdd8786a-8b42-4827-ae1d-129efd31fc03', N'ivIy//feUESiKNEJ6U9jNQ==mfObF1awLkKwZLOCK3d26g==', CAST(N'2026-01-06T04:22:33.8824859' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-07T04:22:33.8808867' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6b3e630b-c3ed-4984-b292-14112d213d03', N'23J1l7fs60CuryX4fSygVA==D7cfvKBMakqvQ8GQ/aLrJw==', CAST(N'2026-01-06T04:33:54.5279593' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T04:33:54.5269598' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a2bf4281-0242-4964-8929-157452416217', N'aGuX9eOv9U+KPwXgGq50Yg==dwVByetWtkejcoUGRkwqkg==', CAST(N'2026-01-04T18:55:34.5848596' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-05T18:55:34.5828460' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3ac91b2c-bf58-4bea-9edb-162c2c27b0b2', N'eklg038BeEaLYbbpUarMag==sOd9jfdM4Eym5naUMzsQSg==', CAST(N'2025-12-30T09:40:30.4550304' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:40:30.4537990' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'fdd738f4-8087-45a1-897b-18074a358031', N'egR6eEUMLkGOVFf2/uBZSQ==SUoyY/ZzckuCzMCrmAmo0A==', CAST(N'2026-01-06T01:12:08.1156365' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T01:12:08.1146762' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ea8d416a-2759-4797-918d-1958ca28cf4b', N'V79dMYjcoEGvG6+n4lcWeA==47JG199OLUeuNHin/dfkUg==', CAST(N'2026-01-06T04:59:10.2080272' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:10.2080162' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5197b8de-06a6-49ad-8018-1a7dfda24bf9', N'6oEhg+xd20COVDrSKuqksg==404VEBJv1EuGJIhawds0Nw==', CAST(N'2025-12-30T07:57:59.4301321' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T07:57:59.4291979' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'73b2fcfe-67fa-4471-aad3-1c2e15fbfb5d', N'G+yRHdXy7ki9AAKcLd/l0A==UOAEd46UL0OGuDymmYjb4A==', CAST(N'2026-01-06T00:37:21.1298068' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:21.1297967' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'df2454c6-09d8-4ea2-86bd-1de5cd954c46', N'lemiDesd0UyEFHa5UGogFQ==BV8f/xjGBka9GP4lK6FcSQ==', CAST(N'2026-01-06T04:42:19.2390298' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:42:19.2390191' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6e138dad-6dcc-40b1-b12d-1fcc844ad3fd', N'/UKkCXNIlUS+8Pgxl36eFg==/Qg6aGRIC0aePlojbjYdkw==', CAST(N'2026-01-06T04:59:12.4764005' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:12.4763897' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5cc7b16a-d61f-42a3-9cd3-21a889cae38e', N'Pin0hohUm02Kj4o47A7fVA==xByWyxf+FEi4EFG9o1Wkxw==', CAST(N'2025-12-30T08:36:43.7986241' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T08:36:43.7986130' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8765b941-04f9-4193-99b5-23d43d3519bc', N'A4xSry19mEaV4lT+SAD2SA==R0GxJVpmtEmOvc6YeM8zOg==', CAST(N'2026-01-04T19:34:47.1556963' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-05T19:34:47.1556773' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'017e22c1-5a4b-4e6b-92c9-268a7bbcfe54', N'h0+8RFp56U+Cz7zuCFUElA==9hnfUJ3Z4EaVdnLsOxGQjw==', CAST(N'2026-01-05T19:58:17.3149275' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T19:58:17.3149170' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'78e6b871-559b-4c13-a764-272660c11a7a', N'd4vaErQaJkeJv4mBSpbS5A==ow0YNwNjVkCP/HxIKIm01A==', CAST(N'2026-01-06T03:37:46.8421389' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:37:46.8421273' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'bfbd71c8-01f6-4770-ba82-276b998c05f2', N'1Rkf+V2dlE+Q2/TgTw6Ceg==N0y8CvIfWEmfWgeN0dOl4Q==', CAST(N'2026-01-05T21:56:31.7404479' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7404383' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'dc868683-0fb6-441c-965b-27b1c55ca0ee', N'BIeLnK0kqEGufLKtZw/DTA==E0XDXSIiwUq/oBgmEPoIgQ==', CAST(N'2025-12-30T09:56:38.5884814' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:56:38.5878705' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e9afbdc0-17df-4c93-84a7-27e67af6493f', N'u2vTb/j2/UOp9inFGg220g==JW1yHI1+9UCsRjTjcl1CbA==', CAST(N'2026-01-04T18:55:34.5848492' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-05T18:55:34.5828414' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'9c0cd6f7-2593-471e-8895-2b40cc64446f', N'pctU59hiq0SepKIDtboNWQ==NtvPhNJBXUuEY/VtBg7TeQ==', CAST(N'2025-12-30T09:24:19.0495159' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:24:19.0483028' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5aaa1536-d4cd-4806-bdfc-2bb51e99b8e5', N'wzjbREpEW0akaramMmbY4A==p3ToOb3sZUO0dU+X5BTXDw==', CAST(N'2026-01-06T05:15:16.4979346' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:15:16.4979119' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ebc62e83-b399-4645-a052-2e4857ffd080', N'DWd1HrnGn0yK2bqCJBJONA==4ck5AqMmwkqu6OQOTvoFqQ==', CAST(N'2026-01-05T21:56:31.8105534' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.8105452' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd3d865fb-7e82-40ba-b8fe-2e9171373ea1', N'B+yi7ZmnFkeEYre5l9fTvA==2doQZgG3Mk2rHiJpLflEXg==', CAST(N'2026-01-06T04:59:11.7647403' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:11.7647282' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'28e83ac5-115d-4bc0-a2fa-2ee428fee20a', N'ycCjCPrC7E2Se5jAU1GQPg==xqTqwrY08EWKAjYomch4Og==', CAST(N'2026-01-06T06:29:14.8804481' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:29:14.8800599' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3d63d27a-b6e7-4ef4-8cbc-2f68ebc5e6c2', N'He8RMRM5L0+qspheOQO1jQ==+8Wm735y6USaOuVgDhTLgw==', CAST(N'2026-01-05T11:27:00.5529863' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T11:27:00.5512837' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ad35afb9-f024-43c9-b478-309506817766', N'EmFDnSROREuTOAzmC0V0Lg==/ELEu/zmFEaSBxysN8v7kw==', CAST(N'2026-01-05T18:51:56.0101042' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.0100960' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'96fb41bc-ecdd-43eb-8761-31c0e34101b4', N'7bCDHPUBO0aa+PGos6Z+yQ==4b0Y1xc4Uk2Gybie2u1iaA==', CAST(N'2026-01-05T21:01:23.0200136' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T21:01:23.0200041' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a9debb14-eda7-4b7a-ac32-35356ca48654', N'DFmpDdVCpUebVTG4yemonQ==2PYBuXS260ysC4cgkmoLuQ==', CAST(N'2025-12-30T09:40:30.4549975' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:40:30.4537702' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4738e595-ba78-4d0d-abcd-3732b57199a9', N'GAVhZW7v102faBF73Q6sxQ==KRDe7E3NgkqNreqODFl2xg==', CAST(N'2026-01-05T20:16:11.9156569' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.9156425' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'666827b3-a927-43df-9506-3a0a23654295', N'tPS1pNEmRUWyCOKEiqt0Wg==v6L6scP2I0aXvrr4E4fvsA==', CAST(N'2026-01-05T17:23:38.1669980' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T17:23:38.1667200' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ac0940f1-9271-4648-b04c-3a7302227c19', N'jQbsT3g0s0qynrWCMSbl/g==DMNXdUp3jki5IX0qYrWjvg==', CAST(N'2025-12-30T08:58:54.1497902' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:58:54.1497841' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a4e31a51-e82b-403d-a6dc-3abd71699bd5', N'+8Q+uW6l20qiVAWevbZDpw==5fOq06ZLAEmG6oYQmpKI3Q==', CAST(N'2026-01-06T03:59:23.9418848' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:23.9418706' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'530d81c2-3ae3-41d9-8983-3cf07a97f4f5', N'2F3Izpc8ikCUpGSHeaVL5w==9cswjuo3tUe+AHncj8sGIw==', CAST(N'2026-01-06T02:46:07.3013542' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T02:46:07.2995295' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'7067f978-3acb-4ca6-a8b8-3d0ac767fd1e', N'mzQ2Jkbh4UGe/NC3GUax+w==qxXOvBO410ypU7WB0l6v2g==', CAST(N'2026-01-05T00:13:28.2552260' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T00:13:28.2552129' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'931d2c8a-64a4-427c-b20c-3ebfbc813930', N'EIxSsYGc2EGmug4ZDuSF7Q==QquRxiATGkyFUu1STp71bQ==', CAST(N'2026-01-05T23:46:21.4302576' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T23:46:21.4281333' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b01c77b9-8497-42fb-b029-3ee583d2a833', N'o4f3JXKW80KooLfE+IIZ7w==BiVCPrmHREW0M0ITch/M/A==', CAST(N'2026-01-06T05:34:16.6934930' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:16.6934859' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1da23c50-667a-493a-92e6-3ef085c6fb52', N'90DdIFyFqkGK8+SKay+31A==ZCKPDqZ4mUmyBP+1PqpxxQ==', CAST(N'2025-12-29T20:34:52.3988461' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T20:34:52.3988372' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'f76451e3-37ad-4ef5-aa1b-4230c28add6f', N'9Zy0bdj50U6a88Gz+NruEA==dYQPsDcHRUeTnxtYyWWvSQ==', CAST(N'2026-01-05T20:16:12.0932918' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:12.0932802' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3991e4f0-645e-4986-a639-43a1de69701e', N'2uN0yLNlE0yhuWSfYiMsuw==6vjRcd1cGE20864pdyI8Dg==', CAST(N'2025-12-30T08:58:54.1475435' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:58:54.1460390' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a77e44e7-fc25-4a8a-ba5b-440c85935cb7', N'gdu/1OZJiUS/+oU/RHQ4nA==CihsXooP5EChAe7PmbEwUQ==', CAST(N'2026-01-06T06:12:03.8543043' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:12:03.8513727' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3e208982-4f6a-42b8-8076-475f902170fc', N'kO7HErXnC0ORssHMVMGjUg==UO/JA2MTc0OcO0LyCrJ8/w==', CAST(N'2026-01-06T00:02:28.8196104' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:02:28.8195986' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ebb35428-bd2e-43d9-a55c-47ae9b1a2462', N'IMQLOi+YFE2sf322Vx/ymQ==Ga4UfaHHU0m6VEycRvzxHg==', CAST(N'2026-01-06T06:29:14.8804702' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:29:14.8784062' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'c2c38b52-0866-40aa-9789-487ce130b9b9', N'LctLwAEbvUGJRh7aFvusAg==CSQYpgPx8UGw8sbJz5VrjQ==', CAST(N'2026-01-06T07:19:12.4464242' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T07:19:12.4464105' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'39722041-b764-4f42-b82d-48bf9e956ed8', N'e5tr22BDJUufq5ric+NLiQ==Yii9o8vwxUytFinFfAY/oA==', CAST(N'2026-01-06T03:59:25.6266593' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:25.6266497' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4daa7eb2-b93f-49a6-a5d1-4a8ef4c0f51f', N'Z6tpk9dgAU+P4+G5PcvLhw==4RBZaz/ir0a0pUxaf8YVaQ==', CAST(N'2026-01-06T03:59:24.7736394' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:24.7736280' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'9293b840-0862-4046-a5b3-4da4104b4640', N'68UETWI7lkaIKMIFZXOwmw==9qb1l+iPUE25LnkHid1qTw==', CAST(N'2026-01-06T02:08:22.7053770' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T02:08:22.7042020' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'239d741b-2542-48a1-b9c9-4f5e589adfab', N'rPE71Aw05EKa5DRDbrne4A==Xl6ZdesTL0Sertm8A6M5Rg==', CAST(N'2026-01-06T00:53:26.5462571' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:26.5462493' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ed0d4993-4c76-4557-b778-5182c68b734d', N'fiCgopRNkkC52WF2yjwc8w==WSSbIdiBk0CTkoq25b/ZtQ==', CAST(N'2026-01-04T23:54:03.1826308' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-05T23:54:03.1813354' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8ab1a343-d50c-46bf-95d1-52c3d8ab8e70', N'4VETD8fjPkmJZIi51sYKPA==8jr4HZlI0kOVtdvomNSvpA==', CAST(N'2025-12-30T09:24:19.0495119' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:24:19.0482898' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1cb748cb-9a3e-4d4c-9cdb-54e627882dc6', N'r+tSMWYOmki1ayR0Yj/YSQ==y7cqH0O660GJGDlSDtM1WA==', CAST(N'2026-01-06T00:53:25.7526832' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:25.7526712' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'85cadde2-8584-4147-aa3a-55633816b9b2', N'fPIgp6iCA0aj8D/EPbv/sA==YQne4OnxM06Z0W1iHuDMqw==', CAST(N'2026-01-05T21:56:31.8033875' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.8033797' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd8a24d93-d3b7-4a58-b016-597486ca2c21', N'CNxAS/e290Cc3ZGmWCuZwA==CI0mVtIsREm9UoMdHJ3Peg==', CAST(N'2026-01-06T06:29:14.8805427' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:29:14.8783548' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4756be4d-3c52-4711-bfaa-5bbeae32557f', N'Ornd4NY7hEO5fJei57ZkOg==Xf+Wzvzv7Uyw8eUXZC77jQ==', CAST(N'2026-01-05T20:16:11.9111563' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.9111462' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd9780a20-6608-4f93-bf8c-5c0a397e97dc', N'Ac3GrSIEiEGCVguXuehnrQ==tswzuaTm902mI2C2og6B9Q==', CAST(N'2026-01-06T03:59:24.4474765' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:24.4474531' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4529ae17-694d-4d95-9caf-5de64f732fd6', N'8sg10ZCSRka6gAIcydu55A==5i2KRFXfpE6E+qGd678SqQ==', CAST(N'2026-01-06T03:11:49.7277184' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:11:49.7277074' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'54091d55-38b0-4982-b887-5e86fc74636d', N'035utHocN0q/kpOXb05aDA==90KjjPBPRUW0nrAEJashjg==', CAST(N'2026-01-06T07:19:11.8301731' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T07:19:11.8297524' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'0797f3b6-a8aa-4ad9-a875-60d35002515a', N'qo3w8nvW4EGcxl2aAaiFFA==vRpAecmQj0OHS2xb7UYmXQ==', CAST(N'2025-12-30T09:02:40.4502011' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T09:02:40.4501920' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6bd6d3bc-045a-43f8-b09f-63235faeae76', N'6pjsLBg6rECKQlb+BHOpsw==Nhq63nP/3kWuk+lIDAE1wQ==', CAST(N'2025-12-30T08:42:26.6777126' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:42:26.6776738' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd3424141-0149-4868-84d9-655a7f9d9df4', N'OQc7bzN4XEywT9r+LCc0QQ==UPiCGbQxPUacqQ1hS8EnlQ==', CAST(N'2025-12-30T10:12:44.6183700' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T10:12:44.6183532' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'fa701115-d7ed-4c2e-8c2a-6652da5533af', N'fR7YGskk6EapCuQMqFonLw==Gf0NG20t2EG5cjRqygx1yw==', CAST(N'2026-01-06T05:34:16.6171056' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:16.6170855' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8bd769bf-c18b-475c-8e26-67982c8a65c8', N'cxi0HirY102YUtY8d7pjhg==QCtUamwyC0uE5uGZF7QGwQ==', CAST(N'2026-01-05T20:26:11.4012960' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:26:11.4012836' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6912113c-03ba-4bc4-81d9-68fce9a8082a', N'5pJ5pasi5ESaYzXbDyO7Yw==4hkjeO4ee0K6eG0s/pMmbg==', CAST(N'2025-12-29T19:46:16.1999101' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T19:46:16.1981468' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a87110b3-e816-41c2-ab98-6d94134bbd07', N'reE75duuwUWLciW1sNInkA==6GZBKj+JHUidPTYZMsWgBQ==', CAST(N'2026-01-06T12:34:34.7958857' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T12:34:34.7958755' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'88e744b6-629c-4118-9700-70746dec66d4', N'jlrULLoP9E2C4J/OQQEhWg==sP9pnqKe4EW8eGSeZUdsDQ==', CAST(N'2025-12-30T08:23:59.9149559' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T08:23:59.9143806' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ebebc8e0-f12c-44df-8ceb-716803190b91', N'sI39EKXMFkO04QTH3bU34w==BzneG7/pzUqNpC3eQn7glg==', CAST(N'2026-01-06T12:13:37.2846493' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T12:13:37.2844039' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4b9c19c0-c5f5-4668-af59-72d05953e3f1', N'Wb7X+1b6AUKV0VnOR/ZuLA==3lnQlMxkLkOmnlJoaNyfpQ==', CAST(N'2026-01-05T20:19:47.2817540' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T20:19:47.2804353' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'c5e9ca48-e727-4ca5-8c48-73268493d455', N'g2wLPJtSA0miutUhnif9BA==P69nwwuEvkixF0zhGHq+3Q==', CAST(N'2025-12-30T08:37:21.1370739' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T08:37:21.1370658' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'37d3b0eb-e45f-4744-9399-742826722aec', N'Q1EFdTUTVUaFpfePB35/Og==lsmhlxkEOEmd/4Jh/BioxQ==', CAST(N'2026-01-05T19:40:55.7796035' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T19:40:55.7783847' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6020ccf3-e43b-45f5-8872-75d1a143d588', N'8xGY7pPlpU21lfO4yzPtIg==thuDGjfVZUyZP/qsB65Hxg==', CAST(N'2026-01-05T22:06:07.8642556' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T22:06:07.8642477' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b001b147-326b-43fc-bf9c-7722f39a1bce', N'xrCuhOb5YEG8HuVwtjO8lw==qnSuJguHnkqKx6jJvUb0WA==', CAST(N'2026-01-06T04:59:10.2080272' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:10.2080162' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e249469d-9e91-4d01-babb-7aa1779cda45', N'zDT25hU/+EOptlZxXeRvsg==4Vy8wY37HEqjuVXTDr74gA==', CAST(N'2026-01-06T00:37:20.1257522' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:20.1257401' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'82589f92-1f28-4999-a9f6-7b4326f57b0b', N'0eEkQQRR1UGYDUhMl6tS3Q==WeISkiDtq0uXTuZpvBv8oQ==', CAST(N'2026-01-06T02:25:20.1403460' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T02:25:20.1403319' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'13109ab8-efc1-471a-86d2-7c5e2106c286', N'hDjZdrMqSki+6SjBQgycWw==cNSk6F18okiRX/Nr1zDMOg==', CAST(N'2025-12-30T10:22:49.3136897' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T10:22:49.3136813' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'db7347f9-acfa-4a54-add4-7f2edc5e4eb2', N'cUYUvsejtU6GfkRo3pk9aw==x5wf+ww8OEu/5cDDI1AMlA==', CAST(N'2026-01-06T07:19:12.4189330' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T07:19:12.4189183' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6882e2eb-4e42-4c91-b01c-8008639a7845', N'YeMEY1XS0UmJJkY+WY5qTw==5HU5J5GjKU6+ARNR/OrWEA==', CAST(N'2026-01-05T18:51:56.0141353' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.0141263' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4d9a8423-779f-4577-a968-80d59dd7a34b', N'JylbxIE3MEifLz4bm7NTFA==PA85WlXTmkWry45LiapTBQ==', CAST(N'2026-01-05T18:51:55.9802034' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:55.9801944' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5aefb4c2-2af4-4998-aaac-81a660f2b9fd', N'+ku4cDkOAUqq0qqK9LQ9Tg==93NPu6gIC0GDrQGAB2xbBQ==', CAST(N'2026-01-05T22:28:51.7136452' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T22:28:51.7136326' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8e2f3c3c-a570-46f0-a3d7-84871d414e3d', N'h1pf3iRKNk+r870lvLSFeg==2lj0zuZWeEWXd/R34pzvGg==', CAST(N'2026-01-06T00:18:57.3328054' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:18:57.3327925' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'37c087cb-4468-4c48-acf6-872238dcf450', N'L12gcYpq+ECoQdtPRC5IDA==tFPKnB8iqUC2nbPwG7YwKQ==', CAST(N'2026-01-04T19:34:47.1756782' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-05T19:34:47.1756654' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a21c3f56-904c-4670-9a3d-8764e7f7490e', N'WFUiK8FNekG9FdrBfoe8RQ==GRWsoeF9sEC701sK0RqeoA==', CAST(N'2026-01-06T05:34:15.8142816' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:15.8142705' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd1aba170-404c-4a85-af70-88c60f4a7ae9', N'4elIqSJ/7kOgbbGNvLUxsw==loFd9XUQ60elMUcVLho52A==', CAST(N'2026-01-05T20:16:11.9678433' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.9678347' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'9d9b2cb1-3945-4cb0-bc51-8add36658cae', N'A5eFGkYSKkGlnowuj0y3Mw==lUsGW3FarUy0hgBkAp4S4A==', CAST(N'2026-01-05T18:51:56.0992423' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.0992325' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'45da33b9-f98e-4421-98f4-8b6492e4dc94', N'hKmWa47ubEKIgMT4SEfB7A==tP2WkqZvG0u4RditSMSa2A==', CAST(N'2026-01-05T20:16:11.7534749' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.7520348' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1c03c283-1a5a-4fcf-b1b6-8fdc3e3e7b9a', N'hc8YBg97IkmLBgNlDNw37w==fGCL5Qt5i0+8IhgzHK/GJw==', CAST(N'2026-01-06T00:53:26.0591129' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:26.0591080' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ebbfd94d-6167-47f6-bbf1-90a4c3af0f19', N'rTwCq0brRUqy7m5envNk8g==Baud0CKkNUWUAhQz4MS9Dg==', CAST(N'2026-01-05T20:16:12.0112546' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:12.0112455' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'830b4288-ad34-4f13-9b5c-9109cc5a493a', N'u1A8BpkXYkKH8Au5h1shoQ==NMBpvfmnN0ijzEnMNZj0Cw==', CAST(N'2026-01-05T18:51:55.9617006' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:55.9616867' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a1b5e549-453d-4e04-82f5-91fba123fe13', N'U1K0szjnU0mTQc2Sa8YgLg==96AxXfV9yUWQGjDjDOwKSw==', CAST(N'2026-01-05T00:16:40.5661287' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T00:16:40.5661094' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'05ce1d15-2281-46eb-8f8c-921368b6751b', N'UeKW0/7aTEaIfg2p+jhrvQ==jqX3iTnIT0+9DGq/zSlziw==', CAST(N'2025-12-29T20:34:52.5239072' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T20:34:52.5238919' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5f5b4334-4c57-484e-b80c-928862dba79e', N'HUlRpuLrv027qMiwDYOVtQ==4FYJY2+OtUG7extF0K8LGQ==', CAST(N'2025-12-30T08:58:54.1475291' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:58:54.1460027' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'f383af96-5d3f-4408-b23d-9464e2b9f8b1', N'H+VQj8gbv0+qkGCnSldUaA==yzCSvGPw5k+en8uzn2kwVQ==', CAST(N'2026-01-06T01:36:22.2224051' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T01:36:22.2199102' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'2568945e-13cd-4011-a82e-988f68166c49', N'J/sHrOlLoEOAPQNfcPAqrg==umNfGC+bSk6Y5ZyE15Xmvw==', CAST(N'2026-01-06T03:59:24.1131744' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:24.1131502' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4aacf69d-bbd3-494c-8c01-9c28c136e0de', N'mVbvX5yYNU+ZBy/NiK08JA==ULWRrVjsU0eSsxFRcEihzA==', CAST(N'2025-12-30T09:24:19.0495024' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:24:19.0483113' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'db66e9b0-71ac-4af3-bc2c-9c6577e23093', N'X2YsgMujOU6nRyrX7m+fgA==427J5t1M1U2TfhnwxNX26w==', CAST(N'2026-01-06T04:06:02.7374862' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-07T04:06:02.7374741' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd6adaa8f-2355-4dd6-8c82-9d7486b34a2e', N'vJ15rFZ+AUC0bdvoWmji6A==jywvJaknN0+P/+A/sxsr7A==', CAST(N'2026-01-06T03:11:50.8618733' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:11:50.8618597' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'2c09fb84-1e23-467f-b004-9d7f56e101d4', N'2S3DJkX1OU6zJaAq99u3kA==CyMTkRcf+0qNyK5kUQC+hA==', CAST(N'2026-01-06T00:37:20.0168992' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:20.0168895' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'fba79f02-45cb-42e1-83a1-9dd6182e341d', N'JPSgSRXVB02+PcRcsFDv+g==DI0OW7RjnEi5bGXOupMOdA==', CAST(N'2026-01-05T20:16:11.7802346' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.7802254' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e626b9eb-e279-4745-a4c0-a0c11ae0eaf1', N'VrUaQQDME0yu3kAQCBe2Tw==gTqP6+1dKkCL/4SuD6w4Rg==', CAST(N'2026-01-06T00:02:28.8614595' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:02:28.8614467' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'96d36b1c-2640-4a10-9f8e-a14cb16e44d2', N'Tf5U5VHBcUmL50iqaXwTaQ==DJZy1aElfkqcZ5t2pieJLQ==', CAST(N'2026-01-06T06:12:03.8542981' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:12:03.8514518' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'2be506cc-ef49-47e7-ab55-a3e4fe9dd954', N'3DiF/lLMlEeN+xFwTwKsnQ==nrgUULOk3kGYndV1Uo3njw==', CAST(N'2026-01-06T05:34:15.8498546' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:15.8498429' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'08f1f84c-d419-41a6-8a35-a404c243144f', N'b8XJNJXqLkuqEbq2MS/wzg==funLt74LIk2ihcm7h4NieA==', CAST(N'2025-12-30T08:02:54.1946179' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T08:02:54.1939785' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3cc0894e-373e-4b5d-ab65-a7b9398a41c1', N'IDCFdk3yNES9NXRMx4u7/A==Spm9IZS9hU+OE3FC7IGJ3Q==', CAST(N'2026-01-05T18:51:55.9657156' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:55.9656986' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'fee2d573-25ef-4590-b87c-a7f38b78424d', N'ExtJG1QlcEepugufS4PRpw==ZhkoYVX8sUOccG8EhHMZWA==', CAST(N'2026-01-06T05:34:15.7927660' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:15.7927536' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd44e7bc8-cf54-491c-b8b5-aa4da8a8918e', N'OyFjr1HMbUqxxyJh2lqBmg==6JvUZDj/6U+UCEysq8KBCg==', CAST(N'2026-01-06T05:34:16.0431068' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:16.0430956' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e586eced-cd53-4684-b972-ab0045f06bb2', N'bSu/oZIweU67BPkgjrWTuQ==TBduz4JfXU2rr09R//saCQ==', CAST(N'2026-01-05T21:56:31.7916541' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7916455' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'9c96d2b0-c865-4634-bd6d-adab8aca9a75', N'65gJyrZbQkuFYJC0g3SnSg==LIwWCWdXjUKDKjfsT9AzTw==', CAST(N'2026-01-06T06:29:14.8834718' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:29:14.8834636' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'19fe113d-8e68-4626-b948-af0102d669b6', N'YOzsKkppFkGLDXiWwqDhOQ==+g+Uif6rtUmMdDTaZO43tQ==', CAST(N'2025-12-29T19:50:57.6818481' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T19:50:57.6818370' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'860a6662-84b7-42b2-a7c0-b0dcbb2c527f', N'yHKI2RQlEkecrndswz4skQ==gllWZMfEcE+hRFpXJgj24w==', CAST(N'2026-01-06T00:37:20.4043991' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:20.4043882' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'57203995-a2ff-42f9-a7e5-b12592f4b29c', N'yvzKwaAEyE2AX2VTXWgRWg==2sr9ezJ7U02efPz9NqBIkA==', CAST(N'2026-01-05T20:42:16.2332340' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:42:16.2323598' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'47c04b76-8db6-4185-af30-b1caf4f8493c', N'GpA9CItbU0G2F4pGTCecCA==SQ/WLhMKS0aoktoEmwEphw==', CAST(N'2025-12-30T08:58:54.1475631' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:58:54.1460341' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'950f9b9f-8bd4-422b-b57f-b2039ccd31b0', N'IYaBNKkGEkmNkB/W33WltA==4TNQ32ng20a8BwnYrqVycw==', CAST(N'2025-12-30T07:51:17.8725479' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T07:51:17.8725417' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6a09a813-2cfc-4ac0-8989-b20d0fefe79a', N'aKnDRCK61EmD/C0paNNl7Q==DVl+c6Da5UCK90+xsxGB9w==', CAST(N'2026-01-05T21:56:31.7336690' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7336603' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'52112525-920f-423b-9301-b3ac2e426002', N'8u/FpJnK20CL2lC5n6ncGQ==REKDvsbYF0WsNvn3MeDbHg==', CAST(N'2026-01-06T05:18:02.7046745' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:18:02.7046624' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5b8bfdd0-118f-41ac-a862-b3f6161c917c', N'jaOkl+GNr0ObaJE/O9m3XQ==zz4GNyGhDkKyLdKj9OPLtA==', CAST(N'2026-01-05T20:16:12.0867394' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:12.0867288' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'aff04b7a-fdaa-41ac-a808-b41ae5427b94', N'm1o4xlWj5EmJoh+81kJWsQ==ebYtA+3R8kWJxJ/OxITIiA==', CAST(N'2025-12-29T21:54:21.3200744' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-29T21:54:21.3199377' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'cf52ce87-34e5-411d-a334-b5ebb805f867', N'ABmYCyc6NUu1JoT3hV1gXQ==4IPoTc4ZYEmrjb25ZGVFUA==', CAST(N'2026-01-06T00:18:57.3484905' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:18:57.3484792' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b1b41116-c590-4190-9b5b-b849ea7a633f', N'9vXRBWhwgk+pIUXJkTdmGg==LPQ5JtlmEkeittswp9TtIw==', CAST(N'2026-01-05T18:51:56.3544497' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.3544357' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'89740a0b-3c02-4cc6-9ab6-b8507a947505', N'iqSwoy11zEmdsyfTYMUYCA==OPaVuUNFf0OHyOLzBYdhgw==', CAST(N'2026-01-05T18:51:55.9062520' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:55.9046900' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'e8ca0d78-39bf-423f-9317-ba0b9df85e78', N'G6ZsCMdRRU6yGCvnOGo/VA==nkHcbepTREO3pWKmwtDU2g==', CAST(N'2026-01-06T00:53:26.0119835' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:26.0119762' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'3d1e2531-5001-4725-9481-bcded68fd113', N'lzXfdcABpke1gU2FX0FMXw==icZHXWO8J0mWjcFEftaBFg==', CAST(N'2025-12-30T10:17:05.0334571' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T10:17:05.0334477' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5f0273ba-8c0f-4f47-bf75-bd2472c86976', N'VX+zFmZpmUmynVTIIstLXA==nu4yldjJfUWtySh96VI4YA==', CAST(N'2025-12-30T07:58:33.7395194' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T07:58:33.7395090' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ac8ce125-12b7-4ed6-9419-bfcbc4121cb4', N'eVjc3/p/bUOQLoWXuyXQuA==lPmGMtksVUyi33QRnoFWpA==', CAST(N'2026-01-05T17:24:12.1565184' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T17:24:12.1565052' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b90061b3-8252-4c87-8118-c58e3d517489', N'9fhncurNh0SWU4dTJIMSHA==b33AyFkEg0inpl2lK/iVrg==', CAST(N'2026-01-05T18:51:56.3177713' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.3177636' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ea41943d-a7e1-4842-87e8-c60e52b99dab', N'yAaJdvGAkE2chaAVIvx/lg==fa0wE8wMc0Cf1MnSXM62/g==', CAST(N'2026-01-06T00:53:26.1753574' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:26.1753511' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'bfd901a6-5db1-4159-b6f2-ca49243d9555', N'J3wsIlcBQUCXAe5hn53pqQ==5dm/ucTJHkOhfEOOHLbKAQ==', CAST(N'2026-01-06T03:11:50.0849725' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:11:50.0849592' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ea667a09-6826-4c3a-9a85-ca960de399f3', N'Dp0LUs0dM0SCZWs1QmNpaw==2DHrcm8fFEy22OdKELmXHA==', CAST(N'2026-01-05T21:29:05.7575561' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:29:05.7564352' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'393e87b1-08db-4a2d-b29a-cb039ff49c9d', N'XsUEnlD19kyO/ivjcPTGbQ==R7rNdBHk5E6vIV4n819zCg==', CAST(N'2026-01-06T03:59:24.1458733' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:24.1458618' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1d61210c-5aab-4dcd-aff2-cefb3f78458f', N'RiI00o9ouE+uPaWuI8L7Yw==HGPnXMeC2kKWN6mrGToJzg==', CAST(N'2025-12-30T08:58:54.1475533' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:58:54.1460162' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd8781507-b2ea-4910-b792-d3301ebe0d2d', N'AvSdwMzaSEW7Qnp4T/eP+A==er2F0Yrjz0mPWwrwblOWoQ==', CAST(N'2026-01-05T23:46:21.4302548' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T23:46:21.4281746' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'7b8ffe01-9bdd-4aef-9354-d480074fd4cc', N'L+NWDwicVkeNEwNBoSILrg==gcoQOJH/vEKfmvEtLBNmHw==', CAST(N'2026-01-06T02:25:20.0825107' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T02:25:20.0824987' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd9f31eea-f2d3-467f-8aa3-d4b4a1d9b4a5', N'0ZfGTo6VZEyo0u3zAWTRMw==TSEMSHhCsUqY1OQzKnCEpw==', CAST(N'2026-01-05T17:42:02.3891362' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T17:42:02.3877167' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'a32aa76d-c03f-4f89-b2d8-d54f6a7b7a49', N'IeQfk5C1JkuhWSeQUnzLdQ==huUwk8giekW+CpmH7sGLXw==', CAST(N'2026-01-06T03:11:51.1596965' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:11:51.1596846' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'be907a3a-d4ea-4919-b4bc-d5df4cd90419', N'3tyuEzHVPE2vugmhLmoRzw==dOBPprHVF0SBz+w0v6qNwQ==', CAST(N'2025-12-30T10:36:38.6539197' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T10:36:38.6539017' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'4f6c204b-1c14-4ffe-907c-d6cb68bc13c2', N'poUL9BtiYUOEAEhAjVF3FQ==74OpfZgER0S8rV13NK8IKg==', CAST(N'2026-01-06T00:37:22.2396848' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:22.2396755' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1affc2e9-d9f0-48c9-b2d8-d891febe2b5c', N'Y0/ON8MilUOjjFGRbIJcUg==zeH6Hi4r4Ee7g+YpG/OU7w==', CAST(N'2025-12-30T09:03:59.9397419' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:03:59.9397177' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6c3fea36-2db8-4833-b75c-d8dc0ac957bc', N'Nlcyv5VwakGGM1WEvWp7GQ==w3AgI8Jnmk+e8Qs8l0OUaw==', CAST(N'2026-01-06T03:37:46.7644762' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:37:46.7644567' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'7683da6b-ff61-4a2b-ad17-d9ce14c23283', N'mpTFRFXsL0K/kM6zkrYrlA==leX3xFvVpkKHyj9vhtQ7xg==', CAST(N'2026-01-06T01:36:22.2224096' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T01:36:22.2198985' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'59400cba-671e-4ab6-a77a-db007ad6d41b', N'ZzXWt7h7dEGbEwEASYm68w==/XU1wHSXwEu91z9hSWTNoA==', CAST(N'2026-01-05T23:46:21.4302262' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T23:46:21.4281230' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'd03f4d4a-569e-4dbd-9687-db3fc2372bc4', N'AtqaQOMfG0eKgWUwL51Tuw==iDLXSj6FAk2hMpyD0z4Kwg==', CAST(N'2025-12-30T09:40:30.4550524' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:40:30.4538265' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8db6651a-ceb0-4cdb-bf32-dbac6b6e0ebc', N'XHXsavbb206J+TrsyVaf/Q==mY6SKoMauE+aQwcUrOiqBw==', CAST(N'2026-01-05T11:27:00.5664799' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T11:27:00.5664633' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5e0df5af-be16-4e28-abe1-dcde014e4b52', N'fUXZhR4DDk6tMYAXh08hdw==AeJKRzRNZU6FZghROmTcGg==', CAST(N'2026-01-06T00:53:25.8233939' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:25.8233693' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ace01aed-127e-4fe6-b7fc-e0a5a432a9b1', N'ddOhZTENeUynq5HMKftFaQ==j0CTIB6esUetvlZgJf0uxw==', CAST(N'2026-01-05T20:16:11.8707507' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.8707390' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'46fcd31f-078c-432a-a096-e11ad645344d', N'XpaVCXtiYUKZFYc5aQuIGw==YpbqBN878U6XuQxqBROIDw==', CAST(N'2026-01-05T19:01:23.8366375' AS DateTime2), 0, N'69ca6f05-839e-486d-fc01-08de34f94b11', CAST(N'2025-12-06T19:01:23.8366259' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'41d032f1-b615-44c2-8b9a-e2badd6e24e1', N'rsFslaKc6EaEVYN/9hlAlw==IztMeLLkrEGKHFX5PL9Nzg==', CAST(N'2026-01-06T05:50:37.3816592' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:50:37.3798302' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'cafa8ecc-01cc-40ce-942e-e5c48b8b0968', N'ztEbIghazESdE/kGMeuWhg==rs8tKztsPUujpP8+dcgZDg==', CAST(N'2026-01-04T23:56:35.9337742' AS DateTime2), 1, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-05T23:56:35.9337636' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5e38aebe-8dd9-4754-b813-e7e52b92fcff', N'OjUhTWovxkmQisTNJWFfVg==sUKoRm68KEmIMCkopBt7+Q==', CAST(N'2026-01-06T05:34:15.9637652' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:34:15.9637545' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'02e4087a-c425-4eec-96ee-e90359b56e68', N'yfcUap7Jf0Gu1/K4oOsCUg==QICkvndni02JwqsV99uixA==', CAST(N'2026-01-05T21:56:31.7842818' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T21:56:31.7842740' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6c13299e-fd72-46f9-b6b3-eb31fee93416', N'gR0qN2HE0kGUKfy686BUpQ==se+CA75C9EegdoCf+btGMA==', CAST(N'2026-01-05T22:22:53.8259098' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-06T22:22:53.8248969' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1ec02efe-cc96-4fda-94fc-ec627448f234', N'k4zPaInSxUGV4wZWSXI06Q==eNTdmKecnE+lhkjOYIW+XA==', CAST(N'2026-01-06T00:37:19.9537282' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:19.9537159' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'ee7b0546-08b3-42b3-8bc4-ed76f2584167', N'TwIPdzctiEqcw9n8a8EHmg==6jwYXHR1sk+bmp23HYnvkw==', CAST(N'2026-01-06T00:37:21.7264434' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:21.7264241' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'68788d3b-0d21-47db-943a-ee44ed142906', N'hthT7uYh/0qYBbHSi/vDhQ==FxqbTwHlYEugNTSqmSu3Qw==', CAST(N'2025-12-30T08:39:43.8504216' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-11-30T08:39:43.8504019' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'289a41e1-0ea9-40d4-8d71-efb103ca198b', N'xa5wD6JxQ0euCDlfPJffog==ZGirGBKhCESMr9VvmUUJ1g==', CAST(N'2026-01-05T20:16:11.9311060' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T20:16:11.9310966' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'1494e21f-bbcb-4cd3-9be5-efcf5ee48b04', N'GT/iPMt3XkGvOr2DeJfytA==n7JSX55870KVUGXnZo7ckg==', CAST(N'2026-01-06T06:29:14.8805204' AS DateTime2), 1, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T06:29:14.8783673' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'6eafa623-a183-45a9-965c-f0799449ef9a', N'Emzk2eSy10mzPZ6xrHaNig==8In1Qiljo0uJEOtdTgZdFQ==', CAST(N'2026-01-06T03:59:24.0144390' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T03:59:24.0144294' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'5afac74c-df4e-4671-9ef0-f1c83180d15b', N'se+4/AA5B0yiqyXGD0m1Nw==rGumKKn/QkqOpXftKdF3eQ==', CAST(N'2026-01-06T01:52:22.7989343' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T01:52:22.7976323' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b43e6663-89e5-4bc9-b3c7-f227e24451a7', N'4zUxJtEWd0yPzzqBq2aSSg==nHZHUxLrYUKL8G/dfpdowA==', CAST(N'2026-01-06T00:37:20.0394924' AS DateTime2), 1, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:37:20.0394822' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'0b9cd342-34b9-40b0-b17c-f3979fa29f99', N'R/yPv+r5Vk6yRx9+GTKrSg==v+47E3ikeEuBoXrTCf+pfA==', CAST(N'2026-01-05T21:56:50.0558889' AS DateTime2), 0, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', CAST(N'2025-12-06T21:56:50.0558801' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'12cacd8b-e2e5-4ad4-a6aa-f3f706d2c100', N'BatphuqllkKjC0VG8pc1Ew==YEiEWmY4SU2am+CbNKz4pg==', CAST(N'2026-01-06T04:59:11.1526357' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:59:11.1525961' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'61c77ab5-7758-4fdb-addf-f4a24987be26', N'DHdwoVtH+Eq7cPqujjDDqw==YBbiKREXy0yluTqMmFc0Rg==', CAST(N'2026-01-06T05:35:27.9695432' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T05:35:27.9695376' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b69dfbe9-16fd-48e9-99e2-f73b862feb14', N'jxZLCuM3Y0q3DTYbeKBbYQ==JGz+r9O0fkmXizj6v+hEYw==', CAST(N'2026-01-06T00:53:26.2213055' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-12-07T00:53:26.2213000' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'b0281ba3-8f3d-4b30-abbb-f790748b239a', N'Ldc/G5KBMkq89WQvXpzPPQ==z2kqaxMbiE+j+l2iW+Apfg==', CAST(N'2025-12-30T10:12:33.8123108' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T10:12:33.8115478' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'816e98cc-ba25-459b-aaf2-f7bc3a35c12d', N'dk/m7Nm7tkmvZ2gd7kSr/A==YLHnCgaKREax5NUMRAcoQw==', CAST(N'2025-12-30T07:48:16.2025820' AS DateTime2), 0, N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-11-30T07:48:16.2015332' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'11a18769-d7d5-4ee9-9dd2-fd15732f641d', N'sbykEVcWLU6WN4ANGk0L8A==INk8VQax30aKfdIGXAY4ow==', CAST(N'2026-01-05T18:51:56.2952941' AS DateTime2), 0, N'0f5469b4-0473-4726-b3a5-08de34f257ff', CAST(N'2025-12-06T18:51:56.2952852' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'8e01fe72-c26c-436e-9574-fdaa36328c94', N'XK0mxzz9jEasv/Sm698khg==wDbwTut3Z0qwLy/xQTB7cw==', CAST(N'2025-12-30T09:40:30.4550494' AS DateTime2), 0, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', CAST(N'2025-11-30T09:40:30.4538165' AS DateTime2))
GO
INSERT [dbo].[RefreshTokens] ([Id], [Token], [ExpiresAt], [Revoked], [UserId], [CreatedAt]) VALUES (N'76698760-8813-4897-83aa-ff51cf6e971d', N'Ox/y8P+URUyVpMaV3DUW4w==C2RlOCQ2bEqQtxv53WYv8A==', CAST(N'2026-01-05T22:28:01.6750985' AS DateTime2), 0, N'69ca6f05-839e-486d-fc01-08de34f94b11', CAST(N'2025-12-06T22:28:01.6734735' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[Reviews] ON 
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (1, 1, NULL, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'Thomas Petit', NULL, 5, N'Excellente semaine sur ce voilier ! Très bien équipé et confortable.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (2, 1, NULL, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'Sophie Bernard', NULL, 5, N'Bateau impeccable, propriétaire très accueillant.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (3, 2, NULL, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'Thomas Petit', NULL, 5, N'Catamaran de rêve ! Navigation facile et très spacieux.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (4, 2, NULL, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'Sophie Bernard', NULL, 5, N'Parfait pour les Cyclades, nous avons adoré !', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (5, 3, NULL, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'Thomas Petit', NULL, 5, N'Belle découverte de la Corse, bateau en excellent état.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (6, 4, NULL, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'Sophie Bernard', NULL, 4, N'Très bon voilier, quelques petits détails à améliorer.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (7, 5, NULL, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'Thomas Petit', NULL, 5, N'Catamaran moderne et très confortable, hautement recommandé !', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (8, 7, NULL, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'Sophie Bernard', NULL, 5, N'Le meilleur catamaran que nous ayons loué !', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (9, 10, NULL, N'518c74cd-3279-4dc2-8a6c-8c074df43835', N'Thomas Petit', NULL, 5, N'Yacht magnifique, service 5 étoiles.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
INSERT [dbo].[Reviews] ([Id], [BoatId], [BookingId], [UserId], [UserName], [UserAvatar], [Rating], [Comment], [CreatedAt], [UpdatedAt]) VALUES (10, 13, NULL, N'e644c21b-7a51-4a7c-8280-b339e3c7f767', N'Sophie Bernard', NULL, 5, N'Parfait pour notre croisière en Grèce.', CAST(N'2025-11-29T17:23:51.3333333' AS DateTime2), NULL)
GO
SET IDENTITY_INSERT [dbo].[Reviews] OFF
GO
SET IDENTITY_INSERT [dbo].[UserDocuments] ON 
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (2, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'Pièce d''identité', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', NULL, N'facture-BK20251206-4a96e80f (3).pdf', 116380, 1, CAST(N'2025-12-07T04:59:44.9986348' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:29:42.0187775' AS DateTime2))
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (3, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'Permis bateau', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', NULL, N'facture-BK20251206-4a96e80f (3).pdf', 116380, 1, CAST(N'2025-12-07T04:59:44.9013865' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:30:15.1540298' AS DateTime2))
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (4, N'f269eeb0-1dad-4935-aaf0-e443aa9fd4b7', N'Permis bateau v2', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', NULL, N'ChatGPT Image 5 déc. 2025, 20_45_28.png', 2352711, 1, CAST(N'2025-12-07T04:59:44.8072927' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:31:20.8491284' AS DateTime2))
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (5, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'Titre de propriété', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', 2, N'facture-BK20251206-4a96e80f (3).pdf', 116380, 1, CAST(N'2025-12-07T05:01:06.2607766' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:40:42.8591093' AS DateTime2))
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (6, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'Permis bateau', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', 2, N'RE1_01_112366827_607250314669.pdf', 312248, 1, CAST(N'2025-12-07T05:01:06.1671684' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:41:07.2940045' AS DateTime2))
GO
INSERT [dbo].[UserDocuments] ([Id], [UserId], [DocumentType], [DocumentUrl], [BoatId], [FileName], [FileSize], [IsVerified], [VerifiedAt], [VerifiedBy], [UploadedAt]) VALUES (7, N'4c160edc-096c-47f2-9d06-c47f75c38ba8', N'Titre de propriété', N'NonImplemente/Aucun-service-de-stockage-V2-commingsooon.pdf', 10, N'facture-BK20251206-4a96e80f (1).pdf', 786, 1, CAST(N'2025-12-07T05:01:06.0659207' AS DateTime2), N'01a99673-f478-461f-a306-133221bcb452', CAST(N'2025-12-07T04:41:19.6952134' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[UserDocuments] OFF
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_EmailConfirmed]  DEFAULT ((0)) FOR [EmailConfirmed]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_PhoneNumberConfirmed]  DEFAULT ((0)) FOR [PhoneNumberConfirmed]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_TwoFactorEnabled]  DEFAULT ((0)) FOR [TwoFactorEnabled]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_LockoutEnabled]  DEFAULT ((0)) FOR [LockoutEnabled]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_AccessFailedCount]  DEFAULT ((0)) FOR [AccessFailedCount]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_FirstName]  DEFAULT (N'') FOR [FirstName]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_LastName]  DEFAULT (N'') FOR [LastName]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_BirthDate]  DEFAULT (sysutcdatetime()) FOR [BirthDate]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Address_Street]  DEFAULT (N'') FOR [Address_Street]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Address_City]  DEFAULT (N'') FOR [Address_City]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Address_State]  DEFAULT (N'') FOR [Address_State]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Address_Zip]  DEFAULT (N'') FOR [Address_PostalCode]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Address_Ctry]  DEFAULT (N'') FOR [Address_Country]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_Status]  DEFAULT ((0)) FOR [Status]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  DEFAULT ((0)) FOR [Verified]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  DEFAULT (getutcdate()) FOR [MemberSince]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_CreatedAt]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  CONSTRAINT [DF_AspNetUsers_UpdatedAt]  DEFAULT (sysutcdatetime()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  CONSTRAINT [DF_AuditLogs_Timestamp]  DEFAULT (sysutcdatetime()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[BoatAvailability] ADD  DEFAULT ((1)) FOR [IsAvailable]
GO
ALTER TABLE [dbo].[BoatAvailability] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[BoatImages] ADD  DEFAULT ((0)) FOR [DisplayOrder]
GO
ALTER TABLE [dbo].[BoatImages] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT ((0)) FOR [Cabins]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT ((0)) FOR [Rating]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT ((0)) FOR [ReviewCount]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT ((0)) FOR [IsVerified]
GO
ALTER TABLE [dbo].[Boats] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Boats] ADD  CONSTRAINT [DF_Boats_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('pending') FOR [Status]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT ('pending') FOR [PaymentStatus]
GO
ALTER TABLE [dbo].[Bookings] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Destinations] ADD  DEFAULT ((0)) FOR [AveragePrice]
GO
ALTER TABLE [dbo].[Destinations] ADD  DEFAULT ((0)) FOR [BoatCount]
GO
ALTER TABLE [dbo].[Destinations] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ExternalLogins] ADD  CONSTRAINT [DF_ExternalLogins_CreatedAt]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Messages] ADD  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [dbo].[Messages] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PasswordResetCodes] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[PasswordResetCodes] ADD  DEFAULT ((0)) FOR [Used]
GO
ALTER TABLE [dbo].[PasswordResetCodes] ADD  DEFAULT ((0)) FOR [Attempts]
GO
ALTER TABLE [dbo].[PasswordResetCodes] ADD  DEFAULT (N'password-reset') FOR [Purpose]
GO
ALTER TABLE [dbo].[PasswordResetCodes] ADD  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PasswordResetTokens] ADD  CONSTRAINT [DF_PasswordResetTokens_Used]  DEFAULT ((0)) FOR [Used]
GO
ALTER TABLE [dbo].[PasswordResetTokens] ADD  CONSTRAINT [DF_PasswordResetTokens_CreatedAt]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[RefreshTokens] ADD  CONSTRAINT [DF_RefreshTokens_Revoked]  DEFAULT ((0)) FOR [Revoked]
GO
ALTER TABLE [dbo].[RefreshTokens] ADD  CONSTRAINT [DF_RefreshTokens_CreatedAt]  DEFAULT (sysutcdatetime()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserDocuments] ADD  DEFAULT ((0)) FOR [IsVerified]
GO
ALTER TABLE [dbo].[UserDocuments] ADD  DEFAULT (getutcdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[AspNetRoleClaims]  WITH CHECK ADD  CONSTRAINT [FK_AspNetRoleClaims_Roles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetRoleClaims] CHECK CONSTRAINT [FK_AspNetRoleClaims_Roles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUserClaims]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserClaims_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserClaims] CHECK CONSTRAINT [FK_AspNetUserClaims_Users_UserId]
GO
ALTER TABLE [dbo].[AspNetUserLogins]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserLogins_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserLogins] CHECK CONSTRAINT [FK_AspNetUserLogins_Users_UserId]
GO
ALTER TABLE [dbo].[AspNetUserRoles]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserRoles_Roles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_Roles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUserRoles]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserRoles_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserRoles] CHECK CONSTRAINT [FK_AspNetUserRoles_Users_UserId]
GO
ALTER TABLE [dbo].[AspNetUserTokens]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUserTokens_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetUserTokens] CHECK CONSTRAINT [FK_AspNetUserTokens_Users_UserId]
GO
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[AuditLogs] CHECK CONSTRAINT [FK_AuditLogs_Users_UserId]
GO
ALTER TABLE [dbo].[BoatAvailability]  WITH CHECK ADD  CONSTRAINT [FK_BoatAvailability_Boats_BoatId] FOREIGN KEY([BoatId])
REFERENCES [dbo].[Boats] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[BoatAvailability] CHECK CONSTRAINT [FK_BoatAvailability_Boats_BoatId]
GO
ALTER TABLE [dbo].[BoatImages]  WITH CHECK ADD  CONSTRAINT [FK_BoatImages_Boats_BoatId] FOREIGN KEY([BoatId])
REFERENCES [dbo].[Boats] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[BoatImages] CHECK CONSTRAINT [FK_BoatImages_Boats_BoatId]
GO
ALTER TABLE [dbo].[Boats]  WITH CHECK ADD  CONSTRAINT [FK_Boats_AspNetUsers_OwnerId] FOREIGN KEY([OwnerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Boats] CHECK CONSTRAINT [FK_Boats_AspNetUsers_OwnerId]
GO
ALTER TABLE [dbo].[Boats]  WITH CHECK ADD  CONSTRAINT [FK_Boats_Destinations_DestinationId] FOREIGN KEY([DestinationId])
REFERENCES [dbo].[Destinations] ([Id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[Boats] CHECK CONSTRAINT [FK_Boats_Destinations_DestinationId]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK_Bookings_AspNetUsers_RenterId] FOREIGN KEY([RenterId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_AspNetUsers_RenterId]
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD  CONSTRAINT [FK_Bookings_Boats_BoatId] FOREIGN KEY([BoatId])
REFERENCES [dbo].[Boats] ([Id])
GO
ALTER TABLE [dbo].[Bookings] CHECK CONSTRAINT [FK_Bookings_Boats_BoatId]
GO
ALTER TABLE [dbo].[ExternalLogins]  WITH CHECK ADD  CONSTRAINT [FK_ExternalLogins_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ExternalLogins] CHECK CONSTRAINT [FK_ExternalLogins_Users_UserId]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Messages_AspNetUsers_ReceiverId] FOREIGN KEY([ReceiverId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Messages_AspNetUsers_ReceiverId]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Messages_AspNetUsers_SenderId] FOREIGN KEY([SenderId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Messages_AspNetUsers_SenderId]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Messages_Boats_BoatId] FOREIGN KEY([BoatId])
REFERENCES [dbo].[Boats] ([Id])
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Messages_Boats_BoatId]
GO
ALTER TABLE [dbo].[Messages]  WITH CHECK ADD  CONSTRAINT [FK_Messages_Bookings_BookingId] FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[Messages] CHECK CONSTRAINT [FK_Messages_Bookings_BookingId]
GO
ALTER TABLE [dbo].[PasswordResetCodes]  WITH CHECK ADD  CONSTRAINT [FK_PasswordResetCodes_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PasswordResetCodes] CHECK CONSTRAINT [FK_PasswordResetCodes_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[PasswordResetTokens]  WITH CHECK ADD  CONSTRAINT [FK_PasswordResetTokens_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PasswordResetTokens] CHECK CONSTRAINT [FK_PasswordResetTokens_Users_UserId]
GO
ALTER TABLE [dbo].[Profiles]  WITH CHECK ADD  CONSTRAINT [FK_Profiles_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Profiles] CHECK CONSTRAINT [FK_Profiles_Users_UserId]
GO
ALTER TABLE [dbo].[RefreshTokens]  WITH CHECK ADD  CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RefreshTokens] CHECK CONSTRAINT [FK_RefreshTokens_Users_UserId]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Boats_BoatId] FOREIGN KEY([BoatId])
REFERENCES [dbo].[Boats] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Boats_BoatId]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Bookings_BookingId] FOREIGN KEY([BookingId])
REFERENCES [dbo].[Bookings] ([Id])
GO
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Bookings_BookingId]
GO
ALTER TABLE [dbo].[UserDocuments]  WITH CHECK ADD  CONSTRAINT [FK_UserDocuments_AspNetUsers_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserDocuments] CHECK CONSTRAINT [FK_UserDocuments_AspNetUsers_UserId]
GO
ALTER TABLE [dbo].[UserDocuments]  WITH CHECK ADD  CONSTRAINT [FK_UserDocuments_AspNetUsers_VerifiedBy] FOREIGN KEY([VerifiedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[UserDocuments] CHECK CONSTRAINT [FK_UserDocuments_AspNetUsers_VerifiedBy]
GO
ALTER TABLE [dbo].[AspNetUsers]  WITH CHECK ADD CHECK  (([UserType]='admin' OR [UserType]='owner' OR [UserType]='renter'))
GO
ALTER TABLE [dbo].[AspNetUsers]  WITH CHECK ADD  CONSTRAINT [CK_AspNetUsers_Status] CHECK  (([Status]=(3) OR [Status]=(2) OR [Status]=(1) OR [Status]=(0)))
GO
ALTER TABLE [dbo].[AspNetUsers] CHECK CONSTRAINT [CK_AspNetUsers_Status]
GO
ALTER TABLE [dbo].[Boats]  WITH CHECK ADD CHECK  (([Type]='semirigid' OR [Type]='motor' OR [Type]='catamaran' OR [Type]='sailboat'))
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD CHECK  (([PaymentStatus]='refunded' OR [PaymentStatus]='failed' OR [PaymentStatus]='succeeded' OR [PaymentStatus]='pending'))
GO
ALTER TABLE [dbo].[Bookings]  WITH CHECK ADD CHECK  (([Status]='cancelled' OR [Status]='completed' OR [Status]='confirmed' OR [Status]='pending'))
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
GO
/****** Object:  StoredProcedure [dbo].[GetUserWithRoles]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetUserWithRoles]
  @UserId UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;
  SELECT u.Id, u.Email, u.FirstName, u.LastName, r.Name AS RoleName
  FROM dbo.AspNetUsers u
  LEFT JOIN dbo.AspNetUserRoles ur ON ur.UserId = u.Id
  LEFT JOIN dbo.AspNetRoles r ON r.Id = ur.RoleId
  WHERE u.Id = @UserId;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_CheckBoatAvailability]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
/****** Object:  StoredProcedure [dbo].[sp_CreateBookingWithValidation]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
/****** Object:  StoredProcedure [dbo].[sp_GetBoatUnavailableDates]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
/****** Object:  StoredProcedure [dbo].[sp_SeedTestData]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_SeedTestData]
AS
BEGIN
    SET NOCOUNT ON;

    ------------------------------------------------------------------
    -- PASSWORD HASH MOCK (utilise un vrai hash Identity en prod)
    ------------------------------------------------------------------
    DECLARE @PasswordHash NVARCHAR(MAX) =
        'AQAAAAIAAYagAAAAEGIempla0OHVlebMR6MImMIYeycuMDU4n/CfaVu+v6IOWyG63nskYQoBc4dkLcHPRg==';


    ------------------------------------------------------------------
    -- USERS : Admin + Owners + Renters (UNIQUEMENT SI MANQUANTS)
    ------------------------------------------------------------------

    -- Admin principal SailingLoc
    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'admin@sailingloc.com')
    BEGIN
        INSERT INTO AspNetUsers
        (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
         PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
         FirstName, LastName, BirthDate,
         Address_Street, Address_City, Address_State, Address_PostalCode, Address_Country,
         Status, UserType, Verified, MemberSince, AvatarUrl, CreatedAt, UpdatedAt)
        VALUES
        (NEWID(), 'admin@sailingloc.com', 'ADMIN@SAILINGLOC.COM',
         'admin@sailingloc.com', 'ADMIN@SAILINGLOC.COM', 1,
         @PasswordHash, NEWID(), NEWID(), '+33123456789',
         'Administrateur', 'SailingLoc', '1985-01-01',
         '', '', '', '', 'France',
         1, 'admin', 1, GETUTCDATE(), NULL, GETUTCDATE(), GETUTCDATE());
    END

    -- Owner 1
    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'jean.dupont@example.com')
    BEGIN
        INSERT INTO AspNetUsers
        (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
         PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
         FirstName, LastName, BirthDate,
         Address_Street, Address_City, Address_State, Address_PostalCode, Address_Country,
         Status, UserType, Verified, MemberSince, AvatarUrl, CreatedAt, UpdatedAt)
        VALUES
        (NEWID(), 'jean.dupont@example.com', 'JEAN.DUPONT@EXAMPLE.COM',
         'jean.dupont@example.com', 'JEAN.DUPONT@EXAMPLE.COM', 1,
         @PasswordHash, NEWID(), NEWID(), '+33612345678',
         'Jean', 'Dupont', '1988-01-01',
         '', '', '', '', 'France',
         1, 'owner', 1, DATEADD(MONTH, -24, GETUTCDATE()), NULL, GETUTCDATE(), GETUTCDATE());
    END

    -- Owner 2
    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'marie.martin@example.com')
    BEGIN
        INSERT INTO AspNetUsers
        (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
         PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
         FirstName, LastName, BirthDate,
         Address_Street, Address_City, Address_State, Address_PostalCode, Address_Country,
         Status, UserType, Verified, MemberSince, AvatarUrl, CreatedAt, UpdatedAt)
        VALUES
        (NEWID(), 'marie.martin@example.com', 'MARIE.MARTIN@EXAMPLE.COM',
         'marie.martin@example.com', 'MARIE.MARTIN@EXAMPLE.COM', 1,
         @PasswordHash, NEWID(), NEWID(), '+33698765432',
         'Marie', 'Martin', '1990-01-01',
         '', '', '', '', 'France',
         1, 'owner', 1, DATEADD(MONTH, -18, GETUTCDATE()), NULL, GETUTCDATE(), GETUTCDATE());
    END

    -- Renter 1
    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'thomas.petit@example.com')
    BEGIN
        INSERT INTO AspNetUsers
        (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
         PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
         FirstName, LastName, BirthDate,
         Address_Street, Address_City, Address_State, Address_PostalCode, Address_Country,
         Status, UserType, Verified, MemberSince, AvatarUrl, CreatedAt, UpdatedAt)
        VALUES
        (NEWID(), 'thomas.petit@example.com', 'THOMAS.PETIT@EXAMPLE.COM',
         'thomas.petit@example.com', 'THOMAS.PETIT@EXAMPLE.COM', 1,
         @PasswordHash, NEWID(), NEWID(), '+33687654321',
         'Thomas', 'Petit', '1995-01-01',
         '', '', '', '', 'France',
         1, 'renter', 1, DATEADD(MONTH, -12, GETUTCDATE()), NULL, GETUTCDATE(), GETUTCDATE());
    END

    -- Renter 2
    IF NOT EXISTS (SELECT 1 FROM AspNetUsers WHERE Email = 'sophie.bernard@example.com')
    BEGIN
        INSERT INTO AspNetUsers
        (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
         PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
         FirstName, LastName, BirthDate,
         Address_Street, Address_City, Address_State, Address_PostalCode, Address_Country,
         Status, UserType, Verified, MemberSince, AvatarUrl, CreatedAt, UpdatedAt)
        VALUES
        (NEWID(), 'sophie.bernard@example.com', 'SOPHIE.BERNARD@EXAMPLE.COM',
         'sophie.bernard@example.com', 'SOPHIE.BERNARD@EXAMPLE.COM', 1,
         @PasswordHash, NEWID(), NEWID(), '+33676543210',
         'Sophie', 'Bernard', '1993-01-01',
         '', '', '', '', 'France',
         1, 'renter', 1, DATEADD(MONTH, -6, GETUTCDATE()), NULL, GETUTCDATE(), GETUTCDATE());
    END

    ------------------------------------------------------------------
    -- VARS réutilisables (owners, renters, admin pour documents)
    ------------------------------------------------------------------
    DECLARE @OwnerA UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType='owner' ORDER BY FirstName);
    DECLARE @OwnerB UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AspNetUsers WHERE UserType='owner' ORDER BY FirstName DESC);

    DECLARE @RenterA UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AspNetUsers WHERE Email='thomas.petit@example.com');
    DECLARE @RenterB UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM AspNetUsers WHERE Email='sophie.bernard@example.com');

    DECLARE @AdminVerifier UNIQUEIDENTIFIER =
    (
        SELECT TOP 1 u.Id
        FROM AspNetUsers u
        JOIN AspNetUserRoles ur ON ur.UserId = u.Id
        JOIN AspNetRoles r ON r.Id = ur.RoleId
        WHERE r.Name = 'Admin'
        ORDER BY u.Email
    );

    IF @AdminVerifier IS NULL
    BEGIN
        SELECT TOP 1 @AdminVerifier = Id FROM AspNetUsers WHERE UserType = 'admin';
    END


------------------------------------------------------------------
-- DESTINATIONS (7) - FIXED COLUMN ALIAS
------------------------------------------------------------------
SET IDENTITY_INSERT Destinations ON;

INSERT INTO Destinations
(Id, Name, Region, Country, Description, AveragePrice, PopularMonths, Highlights)
SELECT *
FROM (VALUES
    (1, 'Côte d''Azur', 'Provence-Alpes-Côte d''Azur', 'France',
     'La Côte d''Azur offre des eaux cristallines et des paysages exceptionnels.',
     450, '["Mai","Juin","Juillet","Août","Septembre"]',
     '["Calanques de Cassis","Îles de Lérins","Saint-Tropez","Monaco","Antibes"]'),

    (2, 'Grèce', 'Méditerranée', 'Grèce',
     'Explorez les îles grecques et leur beauté intemporelle.',
     380, '["Juin","Juillet","Août","Septembre"]',
     '["Santorin","Mykonos","Cyclades","Îles Ioniennes","Crète"]'),

    (3, 'Corse', 'Corse', 'France',
     'L''île de beauté avec ses criques sauvages et ses montagnes.',
     420, '["Juin","Juillet","Août","Septembre"]',
     '["Bonifacio","Calvi","Porto-Vecchio","Réserve de Scandola","Calanques de Piana"]'),

    (4, 'Croatie', 'Adriatique', 'Croatie',
     'Des milliers d''îles à découvrir le long de la côte dalmate.',
     350, '["Mai","Juin","Juillet","Août","Septembre"]',
     '["Dubrovnik","Split","Îles Kornati","Hvar","Zadar"]'),

    (5, 'Baléares', 'Îles Baléares', 'Espagne',
     'Majorque, Minorque, Ibiza et Formentera vous attendent.',
     320, '["Mai","Juin","Juillet","Août","Septembre","Octobre"]',
     '["Majorque","Minorque","Ibiza","Formentera","Cabrera"]'),

    (6, 'Bretagne', 'Bretagne', 'France',
     'Découvrez les côtes bretonnes et leurs traditions maritimes.',
     280, '["Juin","Juillet","Août"]',
     '["Golfe du Morbihan","Belle-Île","Archipel des Glénan","Roscoff","Cancale"]'),

    (7, 'Sardaigne', 'Sardaigne', 'Italie',
     'Eaux turquoise et plages paradisiaques de la Méditerranée.',
     390, '["Juin","Juillet","Août","Septembre"]',
     '["Costa Smeralda","Archipel de La Maddalena","Alghero","Cagliari","Golfe d''Orosei"]')
) AS D(Id, Name, Region, Country, Description, AveragePrice, PopularMonths, Highlights)
WHERE NOT EXISTS (SELECT 1 FROM Destinations WHERE Id = D.Id);

SET IDENTITY_INSERT Destinations OFF;



------------------------------------------------------------------
-- BOATS (14) - FIXED COLUMN ALIAS
------------------------------------------------------------------
SET IDENTITY_INSERT Boats ON;

INSERT INTO Boats
(Id, Name, Type, Location, City, DestinationId, Country,
 Price, Capacity, Cabins, Length, Year, Rating, ReviewCount,
 Equipment, Description, OwnerId, IsActive, IsVerified)
SELECT *
FROM (VALUES
    (1,'Bénéteau Oceanis 45','sailboat','Nice','Nice',1,'France',350,8,4,13.5,2018,4.8,12,'["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]','Magnifique voilier pour découvrir la Côte d''Azur',@OwnerA,1,1),
    (2,'Lagoon 42 Premium','catamaran','Athènes','Athènes',2,'Grèce',580,10,4,12.8,2020,4.9,18,'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]','Catamaran de luxe pour explorer les Cyclades',@OwnerB,1,1),
    (3,'Jeanneau Sun Odyssey 419','sailboat','Ajaccio','Ajaccio',3,'France',320,8,3,12.5,2019,4.7,9,'["GPS","Guindeau électrique","Annexe"]','Idéal pour naviguer autour de la Corse',@OwnerA,1,1),
    (4,'Bavaria Cruiser 46','sailboat','Split','Split',4,'Croatie',380,10,4,14.3,2017,4.6,15,'["GPS","Pilote automatique","Guindeau électrique"]','Parfait pour explorer la côte croate',@OwnerB,1,1),
    (5,'Fountaine Pajot Astrea 42','catamaran','Palma','Palma de Majorque',5,'Espagne',520,10,4,12.6,2021,4.9,14,'["GPS","Pilote automatique","Climatisation","Dessalinisateur"]','Catamaran moderne pour les Baléares',@OwnerA,1,1),
    (6,'Dufour 460 Grand Large','sailboat','La Rochelle','La Rochelle',6,'France',420,10,5,14.15,2019,4.8,11,'["GPS","Pilote automatique","Guindeau électrique","Annexe avec moteur"]','Grand voilier confortable pour la Bretagne',@OwnerB,1,1),
    (7,'Bali 4.3 Catamaran','catamaran','Cagliari','Cagliari',7,'Italie',550,12,4,13.1,2020,5,8,'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]','Catamaran spacieux pour la Sardaigne',@OwnerA,1,1),
    (8,'Zodiac Medline 850','semirigid','Nice','Nice',1,'France',180,12,0,8.5,2021,4.5,6,'["GPS","Sondeur","Bimini","Échelle de bain"]','Semi-rigide rapide pour balades côtières',@OwnerB,1,1),
    (9,'Bavaria 50 Cruiser','sailboat','Mykonos','Mykonos',2,'Grèce',450,12,5,15.4,2018,4.7,13,'["GPS","Pilote automatique","Climatisation","Guindeau électrique"]','Grand voilier luxueux pour les Cyclades',@OwnerA,1,1),
    (10,'Prestige 520 Fly','motor','Cannes','Cannes',1,'France',890,8,3,15.9,2019,4.9,7,'["GPS","Pilote automatique","Climatisation","Bow thruster","Annexe avec moteur"]','Yacht à moteur de prestige',@OwnerB,1,1),
    (11,'Jeanneau Leader 30','motor','Saint-Tropez','Saint-Tropez',1,'France',420,6,1,9.14,2020,4.6,10,'["GPS","Sondeur","Bimini","Plateforme de bain"]','Bateau à moteur idéal pour la journée',@OwnerA,1,1),
    (12,'Hanse 458','sailboat','Porto-Vecchio','Porto-Vecchio',3,'France',410,10,4,14.0,2018,4.8,12,'["GPS","Pilote automatique","Guindeau électrique"]','Voilier performant et confortable',@OwnerB,1,1),
    (13,'Lagoon 450 F','catamaran','Rhodes','Rhodes',2,'Grèce',620,12,4,13.96,2017,4.9,16,'["GPS","Pilote automatique","Climatisation","Dessalinisateur","Annexe avec moteur"]','Catamaran spacieux et rapide',@OwnerA,1,1),
    (14,'Bénéteau First 40.7','sailboat','Barcelone','Barcelone',5,'Espagne',290,8,3,12.37,2016,4.5,14,'["GPS","Pilote automatique","Guindeau électrique"]','Voilier sportif et maniable',@OwnerB,1,1)
) AS B(Id, Name, Type, Location, City, DestinationId, Country,
       Price, Capacity, Cabins, Length, Year, Rating, ReviewCount,
       Equipment, Description, OwnerId, IsActive, IsVerified)
WHERE NOT EXISTS (SELECT 1 FROM Boats WHERE Id = B.Id);

SET IDENTITY_INSERT Boats OFF;



    ------------------------------------------------------------------
    -- BOAT IMAGES (1..3 images pour certains bateaux)
    ------------------------------------------------------------------
    INSERT INTO BoatImages (BoatId, ImageUrl, Caption, DisplayOrder, CreatedAt)
    SELECT *
    FROM (VALUES
        (1, '/images/boats/1-main.jpg', 'Vue générale du voilier', 1, GETUTCDATE()),
        (1, '/images/boats/1-cockpit.jpg', 'Cockpit spacieux', 2, GETUTCDATE()),
        (1, '/images/boats/1-cabins.jpg', 'Cabines confortables', 3, GETUTCDATE()),

        (2, '/images/boats/2-main.jpg', 'Catamaran Lagoon 42', 1, GETUTCDATE()),
        (2, '/images/boats/2-salon.jpg', 'Carré lumineux', 2, GETUTCDATE()),

        (5, '/images/boats/5-main.jpg', 'Astrea 42 au mouillage', 1, GETUTCDATE()),

        (10, '/images/boats/10-main.jpg', 'Yacht Prestige 520 Fly', 1, GETUTCDATE())
    ) AS BI(BoatId, ImageUrl, Caption, DisplayOrder, CreatedAt)
    WHERE NOT EXISTS (
        SELECT 1 FROM BoatImages 
        WHERE BoatId = BI.BoatId AND DisplayOrder = BI.DisplayOrder
    );


    ------------------------------------------------------------------
    -- BOAT AVAILABILITY (quelques plages d'indispo / dispo)
    ------------------------------------------------------------------
    INSERT INTO BoatAvailability (BoatId, StartDate, EndDate, IsAvailable, Reason, CreatedAt)
    SELECT *
    FROM (VALUES
        (1, '2025-06-01', '2025-06-30', 1, NULL, GETUTCDATE()),
        (1, '2025-07-01', '2025-07-07', 0, 'Révision moteur', GETUTCDATE()),

        (2, '2025-07-01', '2025-07-31', 1, NULL, GETUTCDATE()),
        (2, '2025-08-01', '2025-08-15', 0, 'Bloqué par le propriétaire', GETUTCDATE()),

        (5, '2025-08-01', '2025-08-31', 1, NULL, GETUTCDATE())
    ) AS BA(BoatId, StartDate, EndDate, IsAvailable, Reason, CreatedAt)
    WHERE NOT EXISTS (
        SELECT 1 
        FROM BoatAvailability 
        WHERE BoatId = BA.BoatId 
          AND StartDate = BA.StartDate 
          AND EndDate = BA.EndDate
    );


    ------------------------------------------------------------------
    -- REVIEWS (10, comme ton script)
    ------------------------------------------------------------------
    INSERT INTO Reviews (BoatId, UserId, UserName, Rating, Comment, CreatedAt)
    SELECT *
    FROM (VALUES
        (1, @RenterA, 'Thomas Petit', 5, 'Excellente semaine sur ce voilier ! Très bien équipé et confortable.', GETUTCDATE()),
        (1, @RenterB, 'Sophie Bernard', 5, 'Bateau impeccable, propriétaire très accueillant.', GETUTCDATE()),
        (2, @RenterA, 'Thomas Petit', 5, 'Catamaran de rêve ! Navigation facile et très spacieux.', GETUTCDATE()),
        (2, @RenterB, 'Sophie Bernard', 5, 'Parfait pour les Cyclades, nous avons adoré !', GETUTCDATE()),
        (3, @RenterA, 'Thomas Petit', 5, 'Belle découverte de la Corse, bateau en excellent état.', GETUTCDATE()),
        (4, @RenterB, 'Sophie Bernard', 4, 'Très bon voilier, quelques petits détails à améliorer.', GETUTCDATE()),
        (5, @RenterA, 'Thomas Petit', 5, 'Catamaran moderne et très confortable, hautement recommandé !', GETUTCDATE()),
        (7, @RenterB, 'Sophie Bernard', 5, 'Le meilleur catamaran que nous ayons loué !', GETUTCDATE()),
        (10, @RenterA, 'Thomas Petit', 5, 'Yacht magnifique, service 5 étoiles.', GETUTCDATE()),
        (13, @RenterB, 'Sophie Bernard', 5, 'Parfait pour notre croisière en Grèce.', GETUTCDATE())
    ) AS R(BoatId, UserId, UserName, Rating, Comment, CreatedAt)
    WHERE NOT EXISTS (
        SELECT 1 FROM Reviews 
        WHERE BoatId = R.BoatId 
          AND UserId = R.UserId 
          AND Rating = R.Rating
          AND Comment = R.Comment
    );


    ------------------------------------------------------------------
    -- BOOKINGS (3 réservations de test)
    ------------------------------------------------------------------
    INSERT INTO Bookings
    (Id, BoatId, RenterId, StartDate, EndDate, DailyPrice, Subtotal, ServiceFee, TotalPrice,
     Status, RenterName, RenterEmail, PaymentStatus)
    SELECT *
    FROM (VALUES
        ('BK202501', 1, @RenterA, '2025-06-15', '2025-06-22', 350, 2450, 245, 2695, 'confirmed', 'Thomas Petit', 'thomas.petit@example.com', 'succeeded'),
        ('BK202502', 2, @RenterB, '2025-07-01', '2025-07-08', 580, 4060, 406, 4466, 'confirmed', 'Sophie Bernard', 'sophie.bernard@example.com', 'succeeded'),
        ('BK202503', 5, @RenterA, '2025-08-10', '2025-08-17', 520, 3640, 364, 4004, 'pending', 'Thomas Petit', 'thomas.petit@example.com', 'pending')
    ) AS BK(Id, BoatId, RenterId, StartDate, EndDate, DailyPrice, Subtotal, ServiceFee, TotalPrice, Status, RenterName, RenterEmail, PaymentStatus)
    WHERE NOT EXISTS (SELECT 1 FROM Bookings WHERE Id = BK.Id);


    ------------------------------------------------------------------
    -- MESSAGES (échanges entre locataires et propriétaires)
    ------------------------------------------------------------------
    INSERT INTO Messages
    (SenderId, ReceiverId, BookingId, BoatId, Subject, Content, IsRead, ReadAt, CreatedAt)
    SELECT *
    FROM (VALUES
        (@RenterA, @OwnerA, 'BK202501', 1,
         'Question sur l''embarquement',
         'Bonjour, à quelle heure pouvons-nous embarquer le premier jour ?',
         0, NULL, GETUTCDATE()),

        (@OwnerA, @RenterA, 'BK202501', 1,
         'Re: Question sur l''embarquement',
         'Bonjour Thomas, vous pouvez embarquer à partir de 15h au port de Nice.',
         0, NULL, DATEADD(MINUTE, 5, GETUTCDATE())),

        (@RenterB, @OwnerB, 'BK202502', 2,
         'Itinéraire conseillé dans les Cyclades',
         'Bonjour, avez-vous des suggestions d''itinéraire pour une semaine ?',
         0, NULL, GETUTCDATE())
    ) AS M(SenderId, ReceiverId, BookingId, BoatId, Subject, Content, IsRead, ReadAt, CreatedAt)
    WHERE NOT EXISTS (
        SELECT 1 FROM Messages
        WHERE BookingId = M.BookingId
          AND SenderId = M.SenderId
          AND ReceiverId = M.ReceiverId
          AND Subject = M.Subject
    );


    ------------------------------------------------------------------
    -- USER DOCUMENTS (KYC : CNI, permis bateau, etc.)
    ------------------------------------------------------------------
    INSERT INTO UserDocuments
    (UserId, DocumentType, DocumentUrl, FileName, FileSize,
     IsVerified, VerifiedAt, VerifiedBy, UploadedAt)
    SELECT *
    FROM (VALUES
        (@OwnerA, 'ID Card', '/docs/users/owner1-id.pdf', 'owner1-id.pdf', 150000, 1, DATEADD(DAY, -20, GETUTCDATE()), @AdminVerifier, DATEADD(DAY, -22, GETUTCDATE())),
        (@OwnerA, 'Boat License', '/docs/users/owner1-license.pdf', 'owner1-license.pdf', 120000, 1, DATEADD(DAY, -18, GETUTCDATE()), @AdminVerifier, DATEADD(DAY, -19, GETUTCDATE())),

        (@OwnerB, 'ID Card', '/docs/users/owner2-id.pdf', 'owner2-id.pdf', 145000, 1, DATEADD(DAY, -15, GETUTCDATE()), @AdminVerifier, DATEADD(DAY, -16, GETUTCDATE())),

        (@RenterA, 'ID Card', '/docs/users/renter1-id.pdf', 'renter1-id.pdf', 130000, 1, DATEADD(DAY, -10, GETUTCDATE()), @AdminVerifier, DATEADD(DAY, -11, GETUTCDATE())),
        (@RenterB, 'ID Card', '/docs/users/renter2-id.pdf', 'renter2-id.pdf', 125000, 0, NULL, @AdminVerifier, DATEADD(DAY, -5, GETUTCDATE()))
    ) AS UD(UserId, DocumentType, DocumentUrl, FileName, FileSize, IsVerified, VerifiedAt, VerifiedBy, UploadedAt)
    WHERE NOT EXISTS (
        SELECT 1 
        FROM UserDocuments 
        WHERE UserId = UD.UserId 
          AND DocumentType = UD.DocumentType
    );


    ------------------------------------------------------------------
    -- UPDATE BOAT RATING (comme ton script)
    ------------------------------------------------------------------
    EXEC sp_UpdateBoatRating 1;
    EXEC sp_UpdateBoatRating 2;
    EXEC sp_UpdateBoatRating 3;
    EXEC sp_UpdateBoatRating 4;
    EXEC sp_UpdateBoatRating 5;
    EXEC sp_UpdateBoatRating 7;
    EXEC sp_UpdateBoatRating 10;
    EXEC sp_UpdateBoatRating 13;


    ------------------------------------------------------------------
    PRINT 'SAILINGLOC SEED COMPLETE — toutes les données de test ont été insérées / mises à jour.';
END
GO
/****** Object:  StoredProcedure [dbo].[sp_UpdateBoatRating]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
/****** Object:  StoredProcedure [dbo].[sp_UpdateDestinationBoatCount]    Script Date: 07/12/2025 13:45:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
