import { Form, FormLabel, FormMessage, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod"

type InputFormProps = {
    errors: Errors;
    setErrors: Function;
    setBooking: Function;
    setUser: Function;
    setShowMenu: Function;
}

type Errors = {
    id?: string;
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

export function InputForm({ errors, setErrors, setBooking, setShowMenu, setUser }: InputFormProps) {
    
    const FormSchema = z.object({
        id: z.string({message: "Ce champ est obligatoire"}),
        pswd: z.string({message: "Ce champ est obligatoire"})
    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema)
    })

    const onSubmit = async (logs: z.infer<typeof FormSchema>) => {
        console.log(logs);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person/log-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(logs),
            });

            const data = await res.json();
            console.log(data);

            if (data.error) {
                setErrors(() => ({ id: data.error }));
                console.log(data.error); 
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

                if (data.id) {
                    if (data.seats_remaining <= 0) {
                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/by-person/${data.id}`, {
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
                            <FormControl className="invalid:border-red-500">
                                <Input
                                    type="text"
                                    placeholder="Entrez votre identifiant"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage>{errors && errors.id}</FormMessage>
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
                                    placeholder="Entrez votre mot de passe"
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