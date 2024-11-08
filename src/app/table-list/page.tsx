"use client"
import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
//import PopUpAddTable from '@/components/PopUpAddTable';
import Image from 'next/image';

type TableType = {
    id: string;
    totalSeatsBooked: string;
    number: string;
    name: string;
    seats_number: number;
};

type PersonType = {
    first_name: string;
    last_name: string;
}

type TableFormType = {
    number: string,
    name: string
}

type BookingType = {
    id: number;
    person: PersonType;
}

export default function TableList() {
    const [tablesCopy, setTablesCopy] = useState<TableType[]>([]);
    const [table, setTable] = useState<TableFormType>({ number: "", name: "" });
    const [bookings, setBookings] = useState<BookingType[] | null>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const [idTable, setIdTable] = useState<string>("");


    // Fetching tables on component mount
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/load`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "authorization": "Bearer " + sessionStorage.getItem("token")
                    },
                });
                const tables = await res.json();
                setTablesCopy(JSON.parse(tables));
            } catch (err) {
                console.error('Error fetching tables:', err);
            }
        };
        fetchTables();
    }, []);

    const HandleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setTable({
            ...table,
            [name]: value,
        });
    };

    const checkBookings = async (id: string) => {
        setIdTable(id);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/by-table/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                    "authorization": "Bearer " + sessionStorage.getItem("token")
                }
            })
                .then(res => res.json())
                .then(res => {
                    setBookings(res)
                    setVisible(true);
                })
        }
        catch (err) {
            console.error('Error getting table:', err);
        }
    }

    const Delete = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/delete/${idTable}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "authorization": "Bearer " + sessionStorage.getItem("token")

                },
            });
            setTablesCopy(tablesCopy.filter((table) => table.id !== idTable));
            setVisible(false)
        } catch (err) {
            console.error('Error deleting table:', err);
        }
    };

    const Disable = async (table: TableType) => {
        if (sessionStorage.getItem("user") && JSON.parse(sessionStorage.getItem("user") as string).id) {
            try {
                const body = {
                    person_id: JSON.parse(sessionStorage.getItem("user") as string).id,
                    table_id: table.id
                }
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/new/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "authorization": "Bearer " + sessionStorage.getItem("token")
                    },
                    body: JSON.stringify(body)
                })
                    .then(res => res.json())
                    .then(() => {
                        const tables = tablesCopy.map((res) => {
                            if (res.id == table.id) {
                                res.totalSeatsBooked = "10"
                            }
                            return res
                        })
                        setTablesCopy(tables)
                    })

            } catch (err) {
                console.error('Error table:', err);
            }
        }

    };

    const HandleSubmit = async () => {

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/table/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": "Bearer " + sessionStorage.getItem("token")
            },
            body: JSON.stringify({
                number: parseInt(table.number),
                name: table.name
            })
        })
            .then((res) => res.json())
            .then((res) => {
                addNewTable(res);
                setTable({ number: "", name: "" });
            })
    }

    const addNewTable = (table: string) => {
        const newTable = JSON.parse(table);
        setTablesCopy([
            ...tablesCopy,
            {
                id: newTable.number,
                totalSeatsBooked: '0',
                number: newTable.number,
                name: newTable.name,
                seats_number: 10,
            },
        ]);
    };

    const List = () => (
        <Table>
            <TableHeader className="bg-[#ebebeb] dark:bg-hsl(230,50%,5%)">
                <TableRow>
                    <TableHead className="w-[100px] text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">Numéro</TableHead>
                    <TableHead className="text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">Nom</TableHead>
                    <TableHead className="text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">Places réservées</TableHead>
                    <TableHead className="text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tablesCopy.map((res) => (
                    <TableRow key={res.id} className={parseInt(res.totalSeatsBooked) < 10 ? "hover:bg-gray-100 dark:hover:bg-hsl(230,50%,10%)" : "bg-gray-300 hover:bg-gray-300"}>
                        <TableCell className="font-medium text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">{res.number}</TableCell>
                        <TableCell className="text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">{res.name}</TableCell>
                        <TableCell className="text-hsl(230,50%,5%) dark:text-[#ebebeb] text-center">{res.totalSeatsBooked}</TableCell>
                        <TableCell className='flex justify-center text-center'>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <span className="material-symbols-outlined text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">more_horiz</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuItem onClick={() => checkBookings(res.id)}>
                                        <span>Supprimer</span>
                                    </DropdownMenuItem>
                                    {
                                        parseInt(res.totalSeatsBooked) < 10
                                            ?
                                            <DropdownMenuItem onClick={() => { Disable(res) }}>
                                                <span>Rendre indisponible</span>
                                            </DropdownMenuItem>
                                            :
                                            <></>
                                    }
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <div className="min-h-screen bg-[#ebebeb] dark:bg-hsl(230,50%,5%) p-8">
            <header className="flex justify-between items-center mb-6">
                <div className='flex' onClick={() => { history.back() }}>
                    <span className="material-symbols-outlined">chevron_left</span>
                    <p>Retour</p>
                </div>
                <h1 className="text-3xl font-bold text-center text-hsl(230, 50%, 5%) dark:text-[#ebebeb]">Gestion des Tables</h1>
                <Image src="/gala.png" alt="logo" width={80} height={80} className="dark:brightness-[0.8] dark:grayscale" />
            </header>

            <div className="mb-6">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="default">Ajouter des tables</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[#ebebeb]">
                        <DialogHeader>
                            <DialogTitle>Ajouter une table</DialogTitle>
                            <DialogDescription>
                                Remplissez les informations requises
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="number" className="text-right">
                                    Numéro
                                </Label>
                                <Input id="number" type='number' name="number" placeholder="Numéro de la table" value={table.number} className="col-span-3" onChange={HandleChange} required/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nom
                                </Label>
                                <Input id="name" name="name" placeholder="Nom de la table" value={table.name} className="col-span-3" onChange={HandleChange} required/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={HandleSubmit}>Créer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mb-6">
                <Dialog open={visible} onOpenChange={setVisible}>
                    <DialogContent className="bg-[#ebebeb]">
                        <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                        </DialogHeader>
                        <p>
                            Voulez-vous vraiment supprimer cette table ?<br />
                            Les réservations suivantes seront impactées :
                        </p>
                        {
                            bookings != null && bookings.length > 0
                                ?
                                (
                                    <>
                                        {bookings.map((booking) => (<p key={booking.id} className='text-center'>{booking.person.first_name} {booking.person.last_name}</p>))}
                                    </>
                                )
                                :
                                (<p className='text-center font-thin'>Aucune réservation impactée</p>)
                        }
                        <DialogFooter>
                            <Button onClick={Delete}>Confirmer</Button>
                            <Button variant="outline" onClick={() => setVisible(false)}>
                                Annuler
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>


            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <List />
            </div>
        </div>
    );
}
