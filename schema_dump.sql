--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: availability_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_summary (
    event_id uuid NOT NULL,
    time_slot timestamp with time zone NOT NULL,
    availability_pct integer NOT NULL,
    available_user_ids uuid[] NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT availability_summary_availability_pct_check CHECK (((availability_pct >= 0) AND (availability_pct <= 100)))
);


--
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_attendees (
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) DEFAULT 'guest'::character varying,
    availability timestamp with time zone[],
    CONSTRAINT event_attendees_role_check CHECK (((role)::text = ANY ((ARRAY['host'::character varying, 'guest'::character varying])::text[])))
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    creator_id uuid,
    location character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    potential_dates timestamp with time zone[] DEFAULT '{}'::timestamp with time zone[],
    chain character varying(255),
    timezone character varying(50)
);


--
-- Name: movie_showtimes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movie_showtimes (
    id integer NOT NULL,
    event_id uuid NOT NULL,
    theater_name character varying(255) NOT NULL,
    theater_address text,
    distance character varying(50),
    start_time timestamp with time zone NOT NULL,
    showing_type character varying(100),
    available_users uuid[],
    availability_percentage integer,
    required_time_slots timestamp with time zone[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: movie_showtimes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movie_showtimes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movie_showtimes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movie_showtimes_id_seq OWNED BY public.movie_showtimes.id;


--
-- Name: serpapi_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.serpapi_cache (
    id integer NOT NULL,
    location character varying(255) NOT NULL,
    movie character varying(255) NOT NULL,
    response_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL
);


--
-- Name: serpapi_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.serpapi_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: serpapi_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.serpapi_cache_id_seq OWNED BY public.serpapi_cache.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255),
    name character varying(100),
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: movie_showtimes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_showtimes ALTER COLUMN id SET DEFAULT nextval('public.movie_showtimes_id_seq'::regclass);


--
-- Name: serpapi_cache id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serpapi_cache ALTER COLUMN id SET DEFAULT nextval('public.serpapi_cache_id_seq'::regclass);


--
-- Name: availability_summary availability_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_summary
    ADD CONSTRAINT availability_summary_pkey PRIMARY KEY (event_id, time_slot);


--
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (event_id, user_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: movie_showtimes movie_showtimes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_showtimes
    ADD CONSTRAINT movie_showtimes_pkey PRIMARY KEY (id);


--
-- Name: serpapi_cache serpapi_cache_location_movie_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serpapi_cache
    ADD CONSTRAINT serpapi_cache_location_movie_key UNIQUE (location, movie);


--
-- Name: serpapi_cache serpapi_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serpapi_cache
    ADD CONSTRAINT serpapi_cache_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_serpapi_cache_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_serpapi_cache_expires ON public.serpapi_cache USING btree (expires_at);


--
-- Name: availability_summary availability_summary_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.availability_summary
    ADD CONSTRAINT availability_summary_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_attendees event_attendees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_attendees event_attendees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: events events_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: movie_showtimes movie_showtimes_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movie_showtimes
    ADD CONSTRAINT movie_showtimes_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

