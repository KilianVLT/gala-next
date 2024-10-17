"use client"; // Important for hooks to work on client-side
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input"; // Shadcn UI component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Shadcn Table
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";


import Image from "next/image";

// Typing for reservations
type Reservation = {
  id: number;
  person: {
    id: number;
    last_name: string;
    role: string;
  };
  table: {
    id: number;
    name: string;
    number: number;
  };
  seats_booked: number;
};

export default function ReservationList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationCopy, setReservationCopy] = useState<Reservation[]>([]);
  const [visible, setVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);



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

  const Delete = async () => {
    console.log(selectedReservation);
    
    if(selectedReservation){
      try {
        await fetch(`http://localhost:3001/booking/delete/${selectedReservation.person.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setReservationCopy(reservationCopy.filter((booking) => booking.person.id !== selectedReservation.person.id));
        setVisible(false)
      } catch (err) {
        console.error('Error deleting table:', err);
      }
    }
    
  };

  const selectReservation = (res: Reservation) => {
    setSelectedReservation(res);
    setVisible(true);
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
              <TableRow key={res.id} className={res.seats_booked < 10 ? "hover:bg-gray-100 dark:hover:bg-hsl(230,50%,10%)" : "bg-gray-300 hover:bg-gray-300"}>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">{res.person.role == "ADMIN" ? "ADMIN" : res.person.last_name}</TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">
                  {res.table.number} - {res.table.name}
                </TableCell>
                <TableCell className="text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">{res.seats_booked}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <span className="material-symbols-outlined text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">more_horiz</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onClick={() => selectReservation(res)}>
                        <span>Supprimer</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Modifier</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={visible} onOpenChange={setVisible}>
        <DialogContent className="bg-[#ebebeb]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Voulez-vous vraiment supprimer cette réservation ?
          </p>
          <DialogFooter>
            <Button onClick={Delete}>Confirmer</Button>
            <Button variant="outline" onClick={() => setVisible(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
