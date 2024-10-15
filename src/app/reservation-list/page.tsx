"use client"; // Important for hooks to work on client-side
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input"; // Shadcn UI component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Shadcn Table
import Image from "next/image";

// Typing for reservations
type Reservation = {
  id: string;
  person: {
    last_name: string;
  };
  table: {
    name: string;
    number: number;
  };
  seats_booked: number;
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationCopy, setReservationCopy] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await fetch("http://localhost:3001/booking/load", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setReservations(data);
        setReservationCopy(data);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations :", error);
      }
    };

    fetchReservations();
  }, []);

  const Filter = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "family") {
      const filtered = reservations.filter((res) =>
        res.person.last_name.toUpperCase().includes(value.toUpperCase())
      );
      setReservationCopy(filtered.length === 0 ? reservations : filtered);
    } else if (name === "table") {
      const filtered = reservations.filter(
        (res) =>
          res.table.name.toUpperCase().includes(value.toUpperCase()) &&
          value !== ""
      );
      setReservationCopy(filtered.length === 0 ? reservations : filtered);
    } else if (value === "") {
      setReservationCopy(reservations);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] dark:bg-hsl(230,50%,5%) p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">
          Gestion des Réservations
        </h1>
        <Image
          src="/gala.png"
          alt="logo"
          width={80}
          height={80}
          className="dark:brightness-[0.8] dark:grayscale"
        />
      </header>

      {/* Filter Inputs */}
      <form id="reservation-filters" className="flex gap-4 mb-6">
        <Input
          type="text"
          name="family"
          placeholder="Chercher une Famille"
          onChange={Filter}
          className="border-gray-300 dark:border-gray-600"
        />
        <Input
          type="text"
          name="table"
          placeholder="Chercher une Table"
          onChange={Filter}
          className="border-gray-300 dark:border-gray-600"
        />
      </form>

      {/* Table Display */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <Table className="min-w-full">
          <TableHeader className="bg-[#ebebeb] dark:bg-hsl(230,50%,5%)">
            <TableRow>
              <TableHead className="text-left text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Famille</TableHead>
              <TableHead className="text-left text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Table</TableHead>
              <TableHead className="text-left text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Places réservées</TableHead>
              <TableHead className="text-left text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservationCopy.map((res) => (
              <TableRow key={res.id} className="hover:bg-gray-100 dark:hover:bg-hsl(230,50%,10%)">
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">{res.person.last_name}</TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">
                  {res.table.number} - {res.table.name}
                </TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">{res.seats_booked}</TableCell>
                <TableCell>
                  <span className="material-symbols-outlined text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">
                    more_horiz
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
