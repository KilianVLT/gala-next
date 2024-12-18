"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import TableList from "@/components/tableList"
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/inputForm";
import Image from "next/image";
import Link from "next/link";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  mail: string;
  seats_remaining: number;
  role: string;
};

interface BookingType {
  id: number;
  person_id: number;
  seats_booked: number;
  table: {
    number: number;
    name: string;
  };
  table_id: number;
}

type LowBookingType = {
  table_id: number;
  person_id: number;
}

type Errors = {
  id?: string;
};

export default function Home() {
  
  const [errors, setErrors] = useState<Errors>({ id: "" });
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showTables, setShowTables] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [booking, setBooking] = useState<BookingType | LowBookingType | null>(null);

  const updateUser = (newValue: User) => {
    setUser(newValue);
  };

  const updateBooking = (newValue: BookingType) => {
    setBooking(newValue);
  }

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

  const LogOut = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      setShowMenu(false);
      setUser(null);
    }
  };

  function Recap() {
    if (booking && booking.hasOwnProperty("id")) {
      const b = booking as BookingType;
      return (<p className="text-center">Vous avez réservé <b>{b.seats_booked} place(s)</b>  pour la table numéro <b>{b.table.number} : {b.table.name}</b></p>)
    }
    else if (booking && booking.hasOwnProperty("table_id")) {
      return (<p className="text-center">Un mail vous a été envoyé sur votre adresse mail de facturation</p>)
    }
  }

  return (
    <div className="w-full h-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div id="home-img" className="flex m-auto md:m-0 lg:m-0 mt-2 justify-center items-center  w-1/4 lg:w-full dark:brightness-[0.2] dark:grayscale md:bg-home-img">
        <Image
          src="/gala.png"
          alt="Image"
          width="400"
          height="400"
          className={showMenu && user?.role === "USER" ? "md:hidden lg:hidden" : ""}
        />
        <Image
          src="/table.png"
          alt="Image"
          width="450"
          height="450"
          className={"w-5/12 md:w-1/2" + showMenu && user?.role === "USER" ? "hidden md:block lg:block" : "hidden"}
        />
      </div>
      <div className="flex-col">
        {showMenu ? (
          <div className="justify-end">
            <Button
              variant="outline"
              className="absolute right-2 top-2 text-sm text-white border-b-2 border-white bg-home-img md:bg-white md:right-10 md:top-5 md:text-foreground md:border-2 md:border-foreground"
              onClick={LogOut}
            >
              Déconnexion
            </Button>
          </div>
        ) : null}
        <div className="h-full flex items-center justify-center">
          <div className="grid w-[400px] mx-4">

            {
              showMenu && user?.role === "USER" && user.seats_remaining > 0?
              <div className="">
                <Button
                  variant="secondary"
                  className="md:hidden lg:hidden text-sm text-white border-b-2 border-white bg-input flex m-auto mt-8"
                  onClick={() => setShowTables(true)}
                >
                  Voir les tables
                </Button>
              </div>:
              <></>
            }

            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold mt-11">
                {showMenu ? user?.role === "USER" && user.seats_remaining <= 0 ? "Merci" : "Bienvenue" : "Connexion"}
              </h1>
              {
                user?.role === "USER" && user.seats_remaining <= 0 ?
                  <p className="text-balance text-muted-foreground">
                    Votre demande a bien été prise en compte
                  </p>
                  :
                  user?.role === "USER" && user.seats_remaining > 0 || !showMenu ?
                    <p className="text-balance text-muted-foreground">
                      Faites votre demande de reservation
                    </p>
                    :
                    <></>
              }
            </div>
            {showMenu && user?.role === "ADMIN" ? (
              <div className="grid gap-4 mt-7">
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
                  <TableList user={user} updateUser={updateUser} updateBooking={updateBooking} />
                ) : (
                  <Recap />
                )
            ) : (
              <div className="grid gap-4">
                <InputForm errors={errors} setErrors={setErrors} setBooking={setBooking} setUser={setUser} setShowMenu={setShowMenu} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showTables} onOpenChange={setShowTables}>
        <DialogContent className="bg-home-img w-5/6 h-3/5 text-white p-0">

          <Image
            src="/table.png"
            alt="Image"
            width="500"
            height="500"
            className={"w-auto flex mt-10"}
          />

        </DialogContent>
      </Dialog>
    </div>
  );
}
