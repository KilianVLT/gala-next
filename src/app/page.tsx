"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import TableList from "@/components/tableList"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

type User = {
  id: number;
  seats_remaining: number;
  role: string;
};

type Logs = {
  id: string;
  pswd: string;
};

export default function Home() {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [logs, setLogs] = useState<Logs>({ id: "", pswd: "" });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Accéder à sessionStorage uniquement côté client
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setShowMenu(true);
      }
    }
  }, []);

  const HandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLogs({
      ...logs,
      [name]: value,
    });
  };

  const LogOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      setShowMenu(false);
      setUser(null);
    }
  };

  const HandleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/person/log-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logs),
      });

      const data = await res.json();

      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      if (Object.keys(data).length > 0) {
        console.log(data);

        const newUser = {
          id: data.id,
          seats_remaining: data.seats_remaining,
          role: data.role,
        };
        sessionStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        setShowMenu(true);
      }
    } catch (err) {
      console.error("error:", err);
    }
  };

  return (
    <div className="w-full h-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div id="home-img" className="flex justify-center items-center h-full w-full dark:brightness-[0.2] dark:grayscale bg-home-img">
        <Image
          src="/gala.png"
          alt="Image"
          width="500"
          height="500"
          className=""
        />
      </div>
      <div className="flex-col">
        {showMenu ? (
          <div className="justify-end">
            <Button
              variant="outline"
              className="absolute right-10 top-5"
              onClick={LogOut}
            >
              Déconnexion
            </Button>
          </div>
        ) : null}
        <div className="h-full flex items-center justify-center">
          <div className="m-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold">
                {showMenu ? "Bienvenue" : "Connexion"}
              </h1>
              <p className="text-balance text-muted-foreground">
                Faites votre demande de réservation
              </p>
            </div>
            {showMenu && user?.role === "ADMIN" ? (
              <div className="grid gap-4">
                <Link
                  href="/reservation-list"
                  className="m-auto inline-block text-sm underline"
                >
                  Voir les réservations
                </Link>
                <Link
                  href="/table-list"
                  className="m-auto inline-block text-sm underline"
                >
                  Voir les tables
                </Link>
              </div>
            ) : showMenu && user?.role === "USER" ? (
              user.seats_remaining > 0 ?
                (
                  <TableList user={user} />
                ) : (
                  <></>
                )
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="id">Identifiant</Label>
                  <Input
                    id="id"
                    name="id"
                    type="text"
                    placeholder="Entrez votre identifiant"
                    onChange={HandleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="pswd">Mot de passe</Label>
                  </div>
                  <Input
                    id="pswd"
                    name="pswd"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    onChange={HandleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" onClick={HandleSubmit}>
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
