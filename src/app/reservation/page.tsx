
"use client"
import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type User = {
    id: string;
    seats_remaining: number;
};

type TableData = {
    id: string;
    number: number;
    name: string;
    seats_number: number;
    totalSeatsBooked: number;
};

type ReservationFormProps = {
    user: User;
};

export default function ReservationForm({ user }: ReservationFormProps) {
    const [tablesCopy, setTablesCopy] = useState<TableData[]>([]);
    const [visible, setVisible] = useState(false); // For dialog visibility
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    useEffect(() => {
        // Fetch tables when component mounts
        const fetchTables = async () => {
            try {
                const res = await fetch("http://localhost:3001/table/load", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await res.json();

                // Filter tables based on seat availability
                const filteredTables = data.filter(
                    (table: TableData) =>
                        table.seats_number - table.totalSeatsBooked >= user.seats_remaining
                );
                setTablesCopy(filteredTables);
            } catch (error) {
                console.error("Erreur lors du chargement des tables :", error);
            }
        };

        fetchTables();
    }, [user]);

    const handleFilter = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value.length >= 2) {
            const filtered = tablesCopy.filter(
                (table) =>
                    table.name.includes(value) || table.number.toString() === value
            );
            setTablesCopy(filtered.length === 0 ? tablesCopy : filtered);
        } else if (value.length === 0) {
            setTablesCopy(tablesCopy);
        }
    };

    const handleBook = async () => {
        if (selectedTable === null) return;

        const body = {
            table_id: selectedTable,
            person_id: user.id,
        };

        try {
            const res = await fetch("http://localhost:3001/booking/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                user.seats_remaining = 0; // Reset seat availability
                sessionStorage.setItem("user", JSON.stringify(user));
            }
        } catch (error) {
            console.error("Erreur lors de la réservation :", error);
        }
    };

    const selectTable = (id: number) => {
        setSelectedTable(id);
        setVisible(true);
    };

    const TableList = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Places restantes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tablesCopy.map((table) => (
                    <TableRow key={table.id} onClick={() => selectTable(parseInt(table.id))}>
                        <TableCell>{table.number}</TableCell>
                        <TableCell>{table.name}</TableCell>
                        <TableCell>
                            {table.seats_number - table.totalSeatsBooked}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="content p-6 bg-[#ebebeb] dark:bg-hsl(230,50%,5%)">
            <header className="header mb-6">
                <h1 className="text-3xl font-bold text-hsl(230,50%,5%) dark:text-[#ebebeb]">
                    Demande de Réservation
                </h1>
                <Image src="/gala.png" alt="logo" width={50} height={50} />
            </header>

            {user && user.seats_remaining > 0 ? (
                <div>
                    <p className="mb-4 text-lg">
                        Nombre de place à réserver : {user.seats_remaining}
                    </p>
                    <form className="space-y-4">
                        <div className="flex space-x-4">
                            <Input
                                type="text"
                                placeholder="Chercher une Table"
                                onChange={handleFilter}
                            />
                        </div>

                        <div id="table-list" className="rounded-md border">
                            <TableList />
                        </div>
                    </form>

                    {/* Dialog (PopUp replacement) */}
                    <Dialog open={visible} onOpenChange={setVisible}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirmer la réservation</DialogTitle>
                            </DialogHeader>
                            <p>
                                Voulez-vous vraiment réserver la table numéro{" "}
                                {selectedTable} ?
                            </p>
                            <DialogFooter>
                                <Button onClick={handleBook}>Confirmer</Button>
                                <Button variant="outline" onClick={() => setVisible(false)}>
                                    Annuler
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div>
                    <p className="text-center">Vous avez déjà réservé.</p>
                </div>
            )}
        </div>
    );
}
