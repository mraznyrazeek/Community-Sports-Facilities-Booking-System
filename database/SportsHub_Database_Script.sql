-- ============================================================
-- SportsHub / Sports Booking System
-- Database Structure Script
-- ============================================================
-- Purpose:
--   Recreates the SportsHub database structure WITHOUT existing data.
--
-- IMPORTANT:
--   Run this script while connected to the SPORTS_BOOKING schema.
--   The script creates tables, sequences, constraints and triggers.
--   It intentionally contains NO INSERT statements.
--
-- Tables:
--   MEMBER
--   SPORT
--   FACILITY
--   MEMBER_SPORT
--   BOOKING
--   REVIEW
--   INQUIRY
--   INQUIRY_RESPONSE
--   NOTIFICATION
-- ============================================================

SET DEFINE OFF;

-- ============================================================
-- 1. SEQUENCES
-- ============================================================

CREATE SEQUENCE MEMBER_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE SPORT_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE FACILITY_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE BOOKING_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE REVIEW_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE INQUIRY_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- ============================================================
-- 2. MEMBER
-- ============================================================

CREATE TABLE MEMBER
(
    MEMBER_ID   NUMBER NOT NULL,
    NAME        VARCHAR2(100) NOT NULL,
    EMAIL       VARCHAR2(150) NOT NULL,
    PHONE       VARCHAR2(20),
    PASSWORD    VARCHAR2(255) NOT NULL,
    STATUS      VARCHAR2(20) NOT NULL,
    CREATED_AT  TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
    USER_ROLE   VARCHAR2(20) DEFAULT 'Member' NOT NULL,

    CONSTRAINT PK_MEMBER_ID
        PRIMARY KEY (MEMBER_ID)
);

-- ============================================================
-- 3. SPORT
-- ============================================================

CREATE TABLE SPORT
(
    SPORT_ID     NUMBER NOT NULL,
    SPORT_NAME   VARCHAR2(50) NOT NULL,
    DESCRIPTION  VARCHAR2(255),

    CONSTRAINT PK_SPORT
        PRIMARY KEY (SPORT_ID),

    CONSTRAINT UQ_SPORT_NAME
        UNIQUE (SPORT_NAME)
);

-- ============================================================
-- 4. FACILITY
-- ============================================================

CREATE TABLE FACILITY
(
    FACILITY_ID    NUMBER NOT NULL,
    SPORT_ID       NUMBER NOT NULL,
    FACILITY_NAME  VARCHAR2(100) NOT NULL,
    DESCRIPTION    VARCHAR2(255),
    LOCATION       VARCHAR2(150) NOT NULL,
    ADDRESS        VARCHAR2(255),
    OPENING_TIME   VARCHAR2(10),
    CLOSING_TIME   VARCHAR2(10),
    STATUS         VARCHAR2(20) NOT NULL,

    CONSTRAINT PK_FACILITY
        PRIMARY KEY (FACILITY_ID),

    CONSTRAINT FACILITY_SPORT_FK
        FOREIGN KEY (SPORT_ID)
        REFERENCES SPORT (SPORT_ID)
);

-- ============================================================
-- 5. MEMBER_SPORT
-- ============================================================

CREATE TABLE MEMBER_SPORT
(
    MEMBER_ID  NUMBER NOT NULL,
    SPORT_ID   NUMBER NOT NULL,
    JOINED_AT  TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_MEMBER_SPORT
        PRIMARY KEY (MEMBER_ID, SPORT_ID),

    CONSTRAINT MEMBER_SPORT_MEMBER_FK
        FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER (MEMBER_ID),

    CONSTRAINT MEMBER_SPORT_SPORT_FK
        FOREIGN KEY (SPORT_ID)
        REFERENCES SPORT (SPORT_ID)
);

-- ============================================================
-- 6. BOOKING
-- ============================================================

CREATE TABLE BOOKING
(
    BOOKING_ID    NUMBER NOT NULL,
    MEMBER_ID     NUMBER NOT NULL,
    FACILITY_ID   NUMBER NOT NULL,
    BOOKING_DATE  DATE NOT NULL,
    START_TIME    VARCHAR2(10) NOT NULL,
    END_TIME      VARCHAR2(10) NOT NULL,
    STATUS        VARCHAR2(20) NOT NULL,
    CREATED_AT    TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_BOOKING
        PRIMARY KEY (BOOKING_ID),

    CONSTRAINT BOOKING_FACILITY_FK
        FOREIGN KEY (FACILITY_ID)
        REFERENCES FACILITY (FACILITY_ID),

    CONSTRAINT BOOKING_MEMBER_FK
        FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER (MEMBER_ID)
);

-- ============================================================
-- 7. REVIEW
-- ============================================================

CREATE TABLE REVIEW
(
    REVIEW_ID     NUMBER NOT NULL,
    MEMBER_ID     NUMBER NOT NULL,
    FACILITY_ID   NUMBER NOT NULL,
    RATING        NUMBER NOT NULL,
    COMMENT_TEXT  VARCHAR2(500),
    CREATED_AT    TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_REVIEW
        PRIMARY KEY (REVIEW_ID),

    CONSTRAINT REVIEW_FACILITY_FK
        FOREIGN KEY (FACILITY_ID)
        REFERENCES FACILITY (FACILITY_ID),

    CONSTRAINT REVIEW_MEMBER_FK
        FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER (MEMBER_ID)
);

-- ============================================================
-- 8. INQUIRY
-- ============================================================

CREATE TABLE INQUIRY
(
    INQUIRY_ID      NUMBER NOT NULL,
    MEMBER_ID       NUMBER NOT NULL,
    NAME            VARCHAR2(100) NOT NULL,
    EMAIL           VARCHAR2(100) NOT NULL,
    SUBJECT         VARCHAR2(150) NOT NULL,
    MESSAGE         VARCHAR2(1000) NOT NULL,
    STATUS          VARCHAR2(20) NOT NULL,
    CREATED_AT      TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
    ADMIN_RESPONSE  VARCHAR2(2000),
    RESPONDED_AT    TIMESTAMP(6),

    CONSTRAINT PK_INQUIRY
        PRIMARY KEY (INQUIRY_ID),

    CONSTRAINT INQUIRY_MEMBER_FK
        FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER (MEMBER_ID)
);

-- ============================================================
-- 9. INQUIRY_RESPONSE
-- ============================================================

CREATE TABLE INQUIRY_RESPONSE
(
    RESPONSE_ID  NUMBER GENERATED BY DEFAULT AS IDENTITY
                 MINVALUE 1
                 MAXVALUE 9999999999999999999999999999
                 INCREMENT BY 1
                 START WITH 1
                 CACHE 20
                 NOORDER
                 NOCYCLE
                 NOKEEP
                 NOSCALE
                 NOT NULL,
    INQUIRY_ID   NUMBER NOT NULL,
    SENDER_ROLE  VARCHAR2(20) NOT NULL,
    MESSAGE      VARCHAR2(1000) NOT NULL,
    CREATED_AT   TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_INQUIRY_RESPONSE
        PRIMARY KEY (RESPONSE_ID),

    CONSTRAINT CK_INQUIRY_RESPONSE_ROLE
        CHECK (SENDER_ROLE IN ('Member', 'Admin')),

    CONSTRAINT FK_INQUIRY_RESPONSE_INQUIRY
        FOREIGN KEY (INQUIRY_ID)
        REFERENCES INQUIRY (INQUIRY_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 10. NOTIFICATION
-- ============================================================

CREATE TABLE NOTIFICATION
(
    NOTIFICATION_ID  NUMBER GENERATED BY DEFAULT AS IDENTITY
                     MINVALUE 1
                     MAXVALUE 9999999999999999999999999999
                     INCREMENT BY 1
                     START WITH 1
                     CACHE 20
                     NOORDER
                     NOCYCLE
                     NOKEEP
                     NOSCALE
                     NOT NULL,
    MEMBER_ID        NUMBER NOT NULL,
    TITLE            VARCHAR2(200) NOT NULL,
    MESSAGE          VARCHAR2(1000) NOT NULL,
    TYPE             VARCHAR2(30) NOT NULL,
    REFERENCE_TYPE   VARCHAR2(30),
    REFERENCE_ID     NUMBER,
    IS_READ          NUMBER(1,0) DEFAULT 0 NOT NULL,
    CREATED_AT       TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT PK_NOTIFICATION
        PRIMARY KEY (NOTIFICATION_ID),

    CONSTRAINT NOTIFICATION_MEMBER_FK
        FOREIGN KEY (MEMBER_ID)
        REFERENCES MEMBER (MEMBER_ID)
        ON DELETE CASCADE
);

-- ============================================================
-- 11. ID GENERATION TRIGGERS
-- ============================================================

CREATE OR REPLACE TRIGGER MEMBER_BI
BEFORE INSERT ON MEMBER
FOR EACH ROW
BEGIN
    IF :NEW.MEMBER_ID IS NULL THEN
        :NEW.MEMBER_ID := MEMBER_SEQ.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER SPORT_BI
BEFORE INSERT ON SPORT
FOR EACH ROW
BEGIN
    IF :NEW.SPORT_ID IS NULL THEN
        :NEW.SPORT_ID := SPORT_SEQ.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER FACILITY_BI
BEFORE INSERT ON FACILITY
FOR EACH ROW
BEGIN
    IF :NEW.FACILITY_ID IS NULL THEN
        :NEW.FACILITY_ID := FACILITY_SEQ.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER BOOKING_BI
BEFORE INSERT ON BOOKING
FOR EACH ROW
BEGIN
    IF :NEW.BOOKING_ID IS NULL THEN
        :NEW.BOOKING_ID := BOOKING_SEQ.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER REVIEW_BI
BEFORE INSERT ON REVIEW
FOR EACH ROW
BEGIN
    IF :NEW.REVIEW_ID IS NULL THEN
        :NEW.REVIEW_ID := REVIEW_SEQ.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER INQUIRY_BI
BEFORE INSERT ON INQUIRY
FOR EACH ROW
BEGIN
    IF :NEW.INQUIRY_ID IS NULL THEN
        :NEW.INQUIRY_ID := INQUIRY_SEQ.NEXTVAL;
    END IF;
END;
/

-- ============================================================
-- 12. END OF DATABASE STRUCTURE
-- ============================================================
-- No INSERT statements are included.
-- Therefore the database will be created empty.
--
-- After successful execution, the following objects will exist:
--
-- Tables:
--   MEMBER
--   SPORT
--   FACILITY
--   MEMBER_SPORT
--   BOOKING
--   REVIEW
--   INQUIRY
--   INQUIRY_RESPONSE
--   NOTIFICATION
--
-- Sequences:
--   MEMBER_SEQ
--   SPORT_SEQ
--   FACILITY_SEQ
--   BOOKING_SEQ
--   REVIEW_SEQ
--   INQUIRY_SEQ
--
-- Triggers:
--   MEMBER_BI
--   SPORT_BI
--   FACILITY_BI
--   BOOKING_BI
--   REVIEW_BI
--   INQUIRY_BI
-- ============================================================

COMMIT;
