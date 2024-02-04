<?php

namespace App\Controller;

use App\Entity\PostIt;
use App\Form\PostitType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PostItController extends AbstractController
{

    #[Route('/nouveau-post-it', name: 'app_post_it')]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        // creates a postit object
        $postit = new PostIt();

        $form = $this->createForm(PostitType::class, $postit);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            
            $data = $form->getData();

            $postit->setRequester($data->getRequester());
            $postit->setRecipient($data->getRecipient());
            $postit->setDeadline($data->getDeadline());
            $postit->setState('a_faire');
            $postit->setColor('yellow');
            $postit->setTicketNumber($data->getTicketNumber());

            $entityManager->persist($postit);
            $entityManager->flush();

            return $this->redirectToRoute('app_home');
        }


        return $this->render('post_it/create.html.twig', [
            'form' => $form,
        ]);
    }

    //edit postit
    #[Route('/post-it/{id}/edit', name: 'app_post_it_edit')]
    public function edit(PostIt $postit, Request $request, EntityManagerInterface $entityManager,$id): Response
    {
        $postit = $entityManager->getRepository(PostIt::class)->find($id);
        if (!$postit) {
            throw $this->createNotFoundException('Aucun post-it trouvé pour l\'id '.$id);
        }
        $form = $this->createForm(PostitType::class, $postit);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_home');
        }

        return $this->render('post_it/edit.html.twig', [
            'postit' => $postit,
            'form' => $form->createView(),
        ]);
    }

    //delete postit
    #[Route('/post-it/{id}/delete', name: 'app_post_it_delete')]
    public function delete(PostIt $postit, EntityManagerInterface $entityManager): Response
    {
        $entityManager->remove($postit);
        
        $entityManager->flush();
    
        return $this->redirectToRoute('app_home');


    }

    #[Route('/deplacer-postit/{id}/{nouvelEtat}/{color}', name:'deplacer_postit', methods: ['POST'])]
    public function deplacerPostit(int $id, string $nouvelEtat, string $color, EntityManagerInterface $entityManager): Response
    {
        $postit = $entityManager->getRepository(Postit::class)->find($id);

        if (!$postit) {
            throw $this->createNotFoundException('Aucun post-it trouvé pour l\'id '.$id);
        }

        $postit->setState($nouvelEtat);
        $postit->setColor($color);
        $entityManager->flush();

        return new Response('Le statut du post-it a été mis à jour avec succès.');
    }

    #[Route('/get-postit-states', name:'get_postit_states')]
    public function getPostitStates(EntityManagerInterface $entityManager): Response
    {
        $postits = $entityManager->getRepository(PostIt::class)->findAll();
        $states = [];

        foreach ($postits as $postit) {
            $states[$postit->getId()] = $postit->getState();
        }

        return $this->json($states);
    }

    #[Route('/get-deadlines', name:'get_deadlines')]
    public function getDeadlines(EntityManagerInterface $entityManager): Response
    {
        $postits = $entityManager->getRepository(PostIt::class)->findAll();
        $deadlines = [];

        foreach ($postits as $postit) {
            
            $deadlines[$postit->getId()] = $postit->getDeadline();
        }

        return $this->json($deadlines);
    }
}
