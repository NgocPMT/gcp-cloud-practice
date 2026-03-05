CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"isDone" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
