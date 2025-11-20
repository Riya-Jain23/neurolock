# Demo usage: insert a patient and an encrypted note, then read back
from db_client import insert_patient, insert_encrypted_note, read_note_plaintext

pid = insert_patient("MRN999", "Demo Patient")
nid = insert_encrypted_note(pid, author="dr.sen", note_text="BP stable. Continue meds.", actor_ip="127.0.0.1")

print("Inserted patient ID =", pid)
print("Inserted note ID    =", nid)
print("Decrypted note      =", read_note_plaintext(nid))
