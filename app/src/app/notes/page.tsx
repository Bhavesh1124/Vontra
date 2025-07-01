'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useAppContext, type Note } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { cn, getTagColorClasses } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function NoteDialog({
  open,
  setOpen,
  note,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  note: Note | null;
}) {
  const { addNote, updateNote, deleteNote } = useAppContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTag(note.tag);
    } else {
      setTitle('');
      setContent('');
      setTag('');
    }
  }, [note, open]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    if (note) {
      updateNote({ ...note, title, content, tag });
    } else {
      addNote({ title, content, tag });
    }
    setOpen(false);
  };
  
  const handleDelete = () => {
      if(note) {
          deleteNote(note.id);
          setOpen(false);
      }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Add New Note'}</DialogTitle>
           <DialogDescription>
            {note ? 'Make changes to your note.' : 'Create a new note to capture your thoughts.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" placeholder="Note title" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tag" className="text-right">
              Tag
            </Label>
            <Input id="tag" value={tag} onChange={(e) => setTag(e.target.value)} className="col-span-3" placeholder="#studytips" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" placeholder="Write your note here..." rows={6} />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
           {note ? (
            <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function NotesPage() {
    const { notes } = useAppContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    const handleAddNoteClick = () => {
        setSelectedNote(null);
        setIsDialogOpen(true);
    };

    const handleNoteCardClick = (note: Note) => {
        setSelectedNote(note);
        setIsDialogOpen(true);
    };

  return (
    <>
    <div className="container mx-auto p-4 md:p-8 relative min-h-screen">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline mb-8">
        Notes & Quick-Capture
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notes.length > 0 ? notes.map(note => (
          <Card key={note.id} onClick={() => handleNoteCardClick(note)} className="bg-card/70 backdrop-blur-lg border border-white/10 shadow-glass hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="truncate">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground line-clamp-4">{note.content}</p>
            </CardContent>
             {note.tag && (
                <div className="p-4 pt-0 mt-auto">
                    <Badge variant="outline" className={cn("font-normal transition-colors", getTagColorClasses(note.tag))}>{note.tag}</Badge>
                </div>
            )}
          </Card>
        )) : (
            <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground">You don't have any notes yet.</p>
                <Button onClick={handleAddNoteClick} className="mt-4">Create your first note</Button>
            </div>
        )}
      </div>
      <Button onClick={handleAddNoteClick} className="fixed bottom-20 right-6 lg:bottom-6 lg:right-6 h-16 w-16 rounded-full shadow-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100 bg-primary hover:bg-primary/90">
        <Plus className="h-8 w-8" />
        <span className="sr-only">Add Note</span>
      </Button>
    </div>
    <NoteDialog open={isDialogOpen} setOpen={setIsDialogOpen} note={selectedNote} />
    </>
  );
}
