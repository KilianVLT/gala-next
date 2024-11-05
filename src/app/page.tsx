"use client";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useForm } from "react-hook-form"
import TableList from "@/components/tableList"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod"
import Image from "next/image";
import Link from "next/link";
import { Form, FormLabel, FormMessage, FormControl, FormField, FormItem } from "@/components/ui/form";

type User = {
  id: number;
  first_name: string;
  last_name: string;
  mail: string;
  seats_remaining: number;
  role: string;
};

type Logs = {
  id: string;
  pswd: string;
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
  table_id: Number;
  person_id: Number;
}

type Errors = {
  id?: string;
};

type InputFormProps = {
  errors: Errors;
  setErrors: Function;
}




export function InputForm({errors, setErrors}: InputFormProps) {

  const FormSchema = z.object({
    // username: z.string()
    //   .optional()
    //   .refine((val) => val === "Kilian", { message: "Ce n'est pas Kilian" }),
    id: z.string(),
    pswd: z.string()
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema)
  })

  const onSubmit = async (logs: z.infer<typeof FormSchema>) => {
    console.log(logs);

    try {
      const res = await fetch("http://localhost:3001/person/log-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logs),
      });

      const data = await res.json();
      console.log(data);

      if(data.error){
        setErrors(() => ({ id: data.error }));
      }
      
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      if (Object.keys(data).length > 0) {
        console.log(data);

        const newUser = {
          id: data.id,
          seats_remaining: data.seats_remaining,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          mail: data.mail
        };

      
      }
    } catch (err) {
      console.error("error:", err);
    }
  }

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiant</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Entrez votre identifiant"
                  {...field}
                  onChange={(e) => setErrors({ id: "" })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <FormField
          control={form.control}
          name="pswd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Entrez votre identifiant"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Se connecter
        </Button>
        
      </form>
    </Form >
  )
}

export default function Home() {
  const [errors, setErrors] = useState<Errors>({id:""});

  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [logs, setLogs] = useState<Logs>({ id: "", pswd: "" });
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
          first_name: data.first_name,
          last_name: data.last_name,
          mail: data.mail
        };

        if (data.id) {
          if (data.seats_remaining <= 0) {
            fetch("http://localhost:3001/booking/by-person/" + data.id, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "authorization": "Bearer " + sessionStorage.getItem("token")
              }
            })
              .then(res => res.json())
              .then((res: BookingType[]) => {
                setBooking(res[0]);
              })
          }
          sessionStorage.setItem("user", JSON.stringify(newUser));
          setUser(newUser);
          setShowMenu(true);
        }
      }
    } catch (err) {
      console.error("error:", err);
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
      <div id="home-img" className="flex justify-center items-center dark:brightness-[0.2] dark:grayscale bg-home-img">
        <Image
          src="/gala.png"
          alt="Image"
          width="400"
          height="400"
          className="w-5/12 md:w-1/2"
        />
      </div>
      <div className="flex-col">
        {showMenu ? (
          <div className="justify-end">
            <Button
              variant="outline"
              className="absolute right-2 top-2 text-sm text-white border-b-2 border-white md:hover:bg-home-img md:right-10 md:top-5 md:text-foreground md:border-2 md:border-foreground"
              onClick={LogOut}
            >
              Déconnexion
            </Button>
          </div>
        ) : null}
        <div className="h-full flex items-center justify-center">
          <div className="grid w-[400px] mx-4">
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
                {/* <InputForm errors={errors} setErrors={setErrors}/> */}
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
